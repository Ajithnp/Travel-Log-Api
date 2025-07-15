export interface IBaseRepository<T> {
 
    create(entity: Partial<T>): Promise<T>;

  
    findById(id: string): Promise<T | null>;


    findOne(query: Partial<T>): Promise<T | null>;

   
    find(query?: Partial<T>,options?: {skip?: number; limit?: number; sort?: any}): Promise<T[]>;

  
    update(id: string, updates: Partial<T>): Promise<T | null>;

 
    delete(id: string): Promise<boolean | null>;
}