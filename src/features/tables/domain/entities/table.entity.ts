import { InvalidTableDataError } from '../errors/invalid-table-data.error';

export interface TableProps {
  sectionId: string; // FK a section
  number: number; // numero_mesa
  capacity: number; // capacidad
  posX: number; // pos_x
  posY: number; // pos_y
  width: number; // ancho
  tableImageId: number; // imagen_mesa_id
  chairImageId: number; // imagen_silla_id
}

export interface TableSnapshot extends TableProps {
  id: string; // mesa_id
}

export type CreateTableProps = TableProps;
export type UpdateTableProps = Partial<TableProps>;

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
      tableImageId: this.nonNegativeInt(props.tableImageId, 'tableImageId'),
      chairImageId: this.nonNegativeInt(props.chairImageId, 'chairImageId'),
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
    return { id: this._id, ...this.props };
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
  get tableImageId(): number {
    return this.props.tableImageId;
  }
  get chairImageId(): number {
    return this.props.chairImageId;
  }

  private static validate(props: TableProps | TableSnapshot): void {
    if (props.number <= 0)
      throw new InvalidTableDataError('number must be > 0');
    if (props.capacity <= 0)
      throw new InvalidTableDataError('capacity must be > 0');
    if (props.width <= 0) throw new InvalidTableDataError('width must be > 0');
    if (props.posX < 0 || props.posY < 0)
      throw new InvalidTableDataError('posX/posY must be >= 0');
    if (props.tableImageId < 0 || props.chairImageId < 0)
      throw new InvalidTableDataError('image ids must be >= 0');
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
