export interface TerraformConfig {
    terraform?: {
        required_version?: string | undefined;
        required_providers?: {
            [x: string]: {
                source?: string | undefined;
                version?: string | undefined;
            } | string;
        }[] | undefined;
        backend?: {
            [x: string]: {
                [x: string]: any;
            }[];
        } | undefined;
    }[] | undefined;
    locals?: {
        [x: string]: any;
    }[] | undefined;
    variable?: {
        [x: string]: {
            type?: string | undefined;
            default?: any | undefined;
            description?: string | undefined;
            sensitive?: boolean | undefined;
            nullable?: (boolean | undefined) | undefined;
            validation?: ({
                [x: string]: {
                    error_message: string;
                    condition?: any;
                };
            }[] | undefined) | undefined;
        }[];
    } | undefined;
    output?: {
        [x: string]: {
            value?: any | undefined;
            description?: (string | undefined) | undefined;
            sensitive?: (boolean | undefined) | undefined;
            depends_on?: (string | undefined) | undefined;
        }[];
    } | undefined;
    provider?: {
        [x: string]: {
            [x: string]: any;
        }[];
    } | undefined;
    module?: {
        [x: string]: {
            source: string;
        }[];
    } | undefined;
    resource?: {
        [x: string]: {
            [x: string]: {
                [x: string]: any;
            }[];
        };
    } | undefined;
    data?: {
        [x: string]: {
            [x: string]: {
                [x: string]: any;
            }[];
        };
    } | undefined;
}
