import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models';
import schema from './graphql/schema'
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {

    public express: express.Application;
    private dataLoaderFatory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {
        this.express = express();
        this.init();
    }

    private init(): void {
        this.requestedFields =  new RequestedFields();
        this.dataLoaderFatory =  new DataLoaderFactory(db, this.requestedFields);
        this.middleware()
    }

    private middleware(): void {
        // this.express.use('/hello', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //     res.send({
        //         hello: 'Hello'
        //     });
        // });
        this.express.use('/graphql', 
        
            extractJwtMiddleware(),

            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFatory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
                next();
            },

            graphqlHTTP((req: express.Request) => ({
                schema: schema,
                graphiql: process.env.NODE_ENV === 'development',
                context: req['context']
            }))
        );
    }

}

export default new App().express;