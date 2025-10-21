import { Table, type TableSnapshot } from '../entities/table.entity';
import {
  TableLayoutCollisionError,
  TableLayoutOutOfBoundsError,
  TableNotFoundError,
  TableNumberConflictError,
  TableSectionNotFoundError,
} from '../errors';
import { ITableDomainRepositoryPort } from '../repositories';
import { ITableSectionPort, type TableSectionSnapshot } from '../ports';
import {
  type TableCreateRequest,
  type TableUpdateRequest,
  type TableDeleteRequest,
} from '../types';

interface TableLayoutCandidate {
  tableId: string;
  sectionId: string;
  posX: number;
  posY: number;
  width: number;
}

export class TableDomainService {
  constructor(
    private readonly tableRepository: ITableDomainRepositoryPort,
    private readonly sectionPort: ITableSectionPort,
  ) {}

  async createTable(request: TableCreateRequest): Promise<Table> {
    const section = await this.ensureSection(request.sectionId);

    const table = Table.create(request.tableId, {
      sectionId: section.sectionId,
      number: request.number,
      capacity: request.capacity,
      posX: request.posX,
      posY: request.posY,
      width: request.width,
      tableImageId: request.tableImageId,
      chairImageId: request.chairImageId,
    });

    const snapshot = table.snapshot();

    await this.ensureUniqueNumber(
      snapshot.sectionId,
      snapshot.number,
      snapshot.id,
    );
    this.ensureLayoutWithinSection(section, snapshot);
    await this.ensureNoCollision(snapshot.sectionId, snapshot, snapshot.id);

    return this.tableRepository.save(table);
  }

  async updateTable(request: TableUpdateRequest): Promise<Table> {
    const existing = await this.ensureTable(request.tableId);

    const nextSectionId = request.sectionId?.trim() ?? existing.sectionId;
    const section = await this.ensureSection(nextSectionId);

    const currentSnapshot = existing.snapshot();
    const nextSnapshot: TableSnapshot = {
      ...currentSnapshot,
      sectionId: nextSectionId,
      number: request.number ?? currentSnapshot.number,
      capacity: request.capacity ?? currentSnapshot.capacity,
      posX: request.posX ?? currentSnapshot.posX,
      posY: request.posY ?? currentSnapshot.posY,
      width: request.width ?? currentSnapshot.width,
      tableImageId: request.tableImageId ?? currentSnapshot.tableImageId,
      chairImageId: request.chairImageId ?? currentSnapshot.chairImageId,
    };

    const candidate = Table.rehydrate(nextSnapshot);
    const candidateSnapshot = candidate.snapshot();

    await this.ensureUniqueNumber(
      candidateSnapshot.sectionId,
      candidateSnapshot.number,
      candidateSnapshot.id,
    );
    this.ensureLayoutWithinSection(section, candidateSnapshot);
    await this.ensureNoCollision(
      candidateSnapshot.sectionId,
      candidateSnapshot,
      candidateSnapshot.id,
    );

    return this.tableRepository.save(candidate);
  }

  async deleteTable(request: TableDeleteRequest): Promise<Table> {
    const existing = await this.ensureTable(request.tableId);
    await this.tableRepository.delete(existing.id);
    return existing;
  }

  private async ensureTable(tableId: string): Promise<Table> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) {
      throw new TableNotFoundError(tableId);
    }
    return table;
  }

  private async ensureSection(
    sectionId: string,
  ): Promise<TableSectionSnapshot> {
    const normalized = sectionId.trim();
    if (!normalized) {
      throw new TableSectionNotFoundError(sectionId);
    }

    const section = await this.sectionPort.loadById(normalized);
    if (!section) {
      throw new TableSectionNotFoundError(normalized);
    }

    return { ...section, sectionId: normalized };
  }

  private async ensureUniqueNumber(
    sectionId: string,
    number: number,
    excludeTableId?: string,
  ): Promise<void> {
    const existing = await this.tableRepository.findBySectionAndNumber(
      sectionId,
      number,
    );

    if (existing && existing.id !== excludeTableId) {
      throw new TableNumberConflictError(sectionId, number);
    }
  }

  private async ensureNoCollision(
    sectionId: string,
    snapshot: TableSnapshot,
    excludeTableId?: string,
  ): Promise<void> {
    const candidate = this.toLayoutCandidate(snapshot);
    const tables = await this.tableRepository.listBySection(sectionId);

    const collides = tables
      .filter((table) => table.id !== excludeTableId)
      .map((table) => this.toLayoutCandidate(table.snapshot()))
      .some((layout) => this.rectanglesOverlap(layout, candidate));

    if (collides) {
      throw new TableLayoutCollisionError(sectionId);
    }
  }

  private ensureLayoutWithinSection(
    section: TableSectionSnapshot,
    snapshot: TableSnapshot,
  ): void {
    const { posX, posY, width } = snapshot;
    const fitsHorizontally = posX >= 0 && posX + width <= section.width;
    const fitsVertically = posY >= 0 && posY + width <= section.height;

    if (!fitsHorizontally || !fitsVertically) {
      throw new TableLayoutOutOfBoundsError(section.sectionId);
    }
  }

  private toLayoutCandidate(snapshot: TableSnapshot): TableLayoutCandidate {
    return {
      tableId: snapshot.id,
      sectionId: snapshot.sectionId,
      posX: snapshot.posX,
      posY: snapshot.posY,
      width: snapshot.width,
    };
  }

  private rectanglesOverlap(
    a: TableLayoutCandidate,
    b: TableLayoutCandidate,
  ): boolean {
    const aRight = a.posX + a.width;
    const aBottom = a.posY + a.width;
    const bRight = b.posX + b.width;
    const bBottom = b.posY + b.width;

    const horizontalOverlap = a.posX < bRight && aRight > b.posX;
    const verticalOverlap = a.posY < bBottom && aBottom > b.posY;

    return horizontalOverlap && verticalOverlap;
  }
}
