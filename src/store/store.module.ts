import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from 'src/schemas/ecommerce/store.schema';
import { StoreRepository } from './store.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
    controllers: [StoreController],
    providers: [StoreService, StoreRepository, JwtService],
    exports: [MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
})
export class StoreModule { }

//If you also want to use the models in another module, add MongooseModule to the exports section of CatsModule and import CatsModule in the other module.
