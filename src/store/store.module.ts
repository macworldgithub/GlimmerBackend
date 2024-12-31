import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from 'src/schemas/ecommerce/store.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
    controllers: [StoreController],
    providers: [StoreService],
    exports: [MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
})
export class StoreModule { }

//If you also want to use the models in another module, add MongooseModule to the exports section of CatsModule and import CatsModule in the other module.
