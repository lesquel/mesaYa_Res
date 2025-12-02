import { Table, type TableSnapshot } from '../entities/table.entity';
import {
  TableLayoutCollisionError,
  TableLayoutOutOfBoundsError,
  TableNotFoundError,
  TableNumberConflictError,
  TableSectionNotFoundError,
} from '../errors';
import { clamp } from '@shared/application/utils';
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
  height: number;
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
      height: request.height ?? request.width,
      tableImageId: request.tableImageId,
      chairImageId: request.chairImageId,
    });

    const snapshot = table.snapshot();

    await this.ensureUniqueNumber(
      snapshot.sectionId,
      snapshot.number,
      snapshot.id,
    );

    // Auto-resolve collision for new tables
    const resolvedSnapshot = await this.resolveCollision(section, snapshot);

    // Update table with resolved position if changed
    if (
      resolvedSnapshot.posX !== snapshot.posX ||
      resolvedSnapshot.posY !== snapshot.posY
    ) {
      table.update({
        posX: resolvedSnapshot.posX,
        posY: resolvedSnapshot.posY,
      });
    }

    this.ensureLayoutWithinSection(section, table.snapshot());
    // Final check (should pass if resolveCollision works)
    await this.ensureNoCollision(
      table.snapshot().sectionId,
      table.snapshot(),
      table.snapshot().id,
    );

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
      height: request.height ?? currentSnapshot.height,
      tableImageId: request.tableImageId ?? currentSnapshot.tableImageId,
      chairImageId: request.chairImageId ?? currentSnapshot.chairImageId,
      status: request.status ?? currentSnapshot.status,
      isAvailable: request.isAvailable ?? currentSnapshot.isAvailable,
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
    const { posX, posY } = snapshot;
    let { width, height } = snapshot;

    if (width < 20) width *= 80;
    if (height < 20) height *= 80;

    const { width: sectionWidth, height: sectionHeight } = this.getEffectiveSectionDimensions(section);

    const fitsHorizontally = posX >= 0 && posX + width <= sectionWidth;
    const fitsVertically = posY >= 0 && posY + height <= sectionHeight;

    if (!fitsHorizontally || !fitsVertically) {
      throw new TableLayoutOutOfBoundsError(section.sectionId, {
        table: { x: posX, y: posY, width, height },
        section: { width: sectionWidth, height: sectionHeight },
      });
    }
  }

  private toLayoutCandidate(snapshot: TableSnapshot): TableLayoutCandidate {
    let width = snapshot.width;
    let height = snapshot.height;

    // Scale if using grid units
    if (width < 20) width *= 80;
    if (height < 20) height *= 80;

    return {
      tableId: snapshot.id,
      sectionId: snapshot.sectionId,
      posX: snapshot.posX,
      posY: snapshot.posY,
      width,
      height,
    };
  }

  private rectanglesOverlap(
    a: TableLayoutCandidate,
    b: TableLayoutCandidate,
  ): boolean {
    const aRight = a.posX + a.width;
    const aBottom = a.posY + a.height;
    const bRight = b.posX + b.width;
    const bBottom = b.posY + b.height;

    const horizontalOverlap = a.posX < bRight && aRight > b.posX;
    const verticalOverlap = a.posY < bBottom && aBottom > b.posY;

    return horizontalOverlap && verticalOverlap;
  }

  private async resolveCollision(
    section: TableSectionSnapshot,
    snapshot: TableSnapshot,
  ): Promise<TableSnapshot> {
    const tables = await this.tableRepository.listBySection(section.sectionId);
    const others = tables.filter((t) => t.id !== snapshot.id);

    const candidate = this.toLayoutCandidate(snapshot);
    const hasCollision = others
      .map((t) => this.toLayoutCandidate(t.snapshot()))
      .some((layout) => this.rectanglesOverlap(layout, candidate));

    if (!hasCollision) {
      return snapshot;
    }

    // Collision detected, find next available spot
    const PADDING = 32;
    const GAP = 36;
    const width = candidate.width;
    const height = candidate.height;

    // Use section dimensions or defaults if missing/small
    const { width: sectionWidth, height: sectionHeight } = this.getEffectiveSectionDimensions(section);

    const spacePerTable = width + GAP;
    const columns = Math.max(
      1,
      Math.floor((sectionWidth - PADDING * 2) / spacePerTable),
    );

    let index = 0;
    // Safety limit to prevent infinite loops
    while (index < 500) {
      const row = Math.floor(index / columns);
      const column = index % columns;

      const rawX = PADDING + column * spacePerTable;
      const rawY = PADDING + row * spacePerTable;

      const maxX = Math.max(0, sectionWidth - width);
      const maxY = Math.max(0, sectionHeight - height);

      const x = clamp(Math.round(rawX), 0, maxX);
      const y = clamp(Math.round(rawY), 0, maxY);

      const newCandidate: TableLayoutCandidate = {
        ...candidate,
        posX: x,
        posY: y,
      };

      const overlaps = others
        .map((t) => this.toLayoutCandidate(t.snapshot()))
        .some((layout) => this.rectanglesOverlap(layout, newCandidate));

      if (!overlaps) {
        return { ...snapshot, posX: x, posY: y };
      }
      index++;
    }

    // If we can't find a spot, return original and let it fail
    return snapshot;
  }

  private getEffectiveSectionDimensions(section: TableSectionSnapshot) {
    let width = section.width;
    let height = section.height;

    // Fix for legacy sections stored in grid units (e.g. 12x8) instead of pixels
    // If the section is suspiciously small, it's likely using grid units.
    if (width < 100) width *= 80; // Assume 80px grid
    if (height < 100) height *= 80;

    return { width, height };
  }
}
