declare global {
    type User = {
        username: string;
        globalName: string;
        email: string;
        password: string;
        externalId: any;
        id: string;
    }
    
    type Server = {
        name: string;
        ownerId: number;
        description: string;
        nestId: number;
        eggId: number;
        cpu: number;
        ram: number;
        disk: number;
        swap: number;
        io: number;
    }

    export interface CreateServerOptions {
        name: string;
        ownerId: number;
        description: string;
        nestId: number;
        eggId: number;
        defaultAllocationId: number;
        cpu: number;
        ram: number;
        disk: number;
    }

    export interface CreateUserOptions {
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        externalId: any;
        password?: string;
    }

    namespace ptero {
        interface User extends User {}
    }
}

export {};