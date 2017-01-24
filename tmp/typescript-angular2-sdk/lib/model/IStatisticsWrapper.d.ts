import * as models from './models';
export interface IStatisticsWrapper {
    Sum?: number;
    Statistics?: {
        [key: string]: models.IStatistics;
    };
}
