export interface Pagination {
  name: string;
  type: string;
  style: string;
  selector: string;
  path: string;
  project?: string;
  module?: string;
  flat?: boolean;
  route?: string;
  export?: boolean;
}
