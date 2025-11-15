import { InvalidTableDataError } from '../errors/invalid-table-data.error';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';

export interface TableProps {
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
  tableImageId: string;
  chairImageId: string;
  status: TableStatus;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TableSnapshot extends TableProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableProps {
  sectionId: string;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  height?: number;
  status?: TableStatus;
  isAvailable?: boolean;
  tableImageId: string;
  chairImageId: string;
}

export type UpdateTableProps = Partial<
  Omit<TableProps, 'createdAt' | 'updatedAt'>
>;

export class Table {
  private constructor(
    private readonly _id: string,
    private props: TableProps,
  ) {}

  static create(id: string, props: CreateTableProps): Table {
    const normalized: TableProps = {
      sectionId: this.normalizeId(props.sectionId, 'Section ID'),
      number: this.positiveInt(props.number, 'number'),
      capacity: this.positiveInt(props.capacity, 'capacity'),
      posX: this.nonNegativeInt(props.posX, 'posX'),
      posY: this.nonNegativeInt(props.posY, 'posY'),
      width: this.positiveInt(props.width, 'width'),
      height: this.positiveInt(props.height ?? props.width, 'height'),
      tableImageId: this.normalizeId(props.tableImageId, 'tableImageId'),
      chairImageId: this.normalizeId(props.chairImageId, 'chairImageId'),
      status: props.status ?? 'AVAILABLE',
      isAvailable: props.isAvailable ?? true,
    };

    this.validate(normalized);
    return new Table(id, normalized);
  }

  static rehydrate(snapshot: TableSnapshot): Table {
    this.validate(snapshot);
    return new Table(snapshot.id, { ...snapshot });
  }

  update(patch: UpdateTableProps): void {
    const next: TableProps = { ...this.props, ...patch } as TableProps;
    Table.validate(next);
    this.props = next;
  }

  snapshot(): TableSnapshot {
    return {
      id: this._id,
      ...this.props,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }

  get id(): string {
    return this._id;
  }
  get sectionId(): string {
    return this.props.sectionId;
  }
  get number(): number {
    return this.props.number;
  }
  get capacity(): number {
    return this.props.capacity;
  }
  get posX(): number {
    return this.props.posX;
  }
  get posY(): number {
    return this.props.posY;
  }
  get width(): number {
    return this.props.width;
  }
  get height(): number {
    return this.props.height;
  }
  get tableImageId(): string {
    return this.props.tableImageId;
  }
  get chairImageId(): string {
    return this.props.chairImageId;
  }
  get status(): TableStatus {
    return this.props.status;
  }
  get isAvailable(): boolean {
    return this.props.isAvailable;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  private static validate(props: TableProps | TableSnapshot): void {
    if (props.number <= 0)
      throw new InvalidTableDataError('number must be > 0');
    if (props.capacity <= 0)
      throw new InvalidTableDataError('capacity must be > 0');
    if (props.width <= 0) throw new InvalidTableDataError('width must be > 0');
    if (props.height <= 0)
      throw new InvalidTableDataError('height must be > 0');
    if (props.posX < 0 || props.posY < 0)
      throw new InvalidTableDataError('posX/posY must be >= 0');
    if (!['AVAILABLE', 'OCCUPIED', 'BLOCKED'].includes(props.status))
      throw new InvalidTableDataError('status must be a valid table state');
    if (typeof props.isAvailable !== 'boolean')
      throw new InvalidTableDataError('isAvailable must be boolean');
    if (
      !props.tableImageId ||
      !props.tableImageId.trim() ||
      !props.chairImageId ||
      !props.chairImageId.trim()
    )
      throw new InvalidTableDataError(
        'image ids must be valid non-empty strings',
      );
  }

  private static normalizeId(value: string, label: string): string {
    if (!value || value.trim().length === 0) {
      throw new InvalidTableDataError(`${label} cannot be empty.`);
    }
    return value.trim();
  }

  private static positiveInt(n: number, label: string): number {
    if (!Number.isInteger(n) || n <= 0)
      throw new InvalidTableDataError(`${label} must be a positive integer`);
    return n;
  }
  private static nonNegativeInt(n: number, label: string): number {
    if (!Number.isInteger(n) || n < 0)
      throw new InvalidTableDataError(
        `${label} must be a non-negative integer`,
      );
    return n;
  }
}
