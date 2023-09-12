
/*
* Common properties for all schemas
* createdAt, updatedAt, isDeleted
*/

import { ObjectId } from "mongodb";

const baseSchema = {
    _id: {
        bsonType: 'objectId',
        description: 'unique identifier for this document',
    },
    createdAt: {
        bsonType: 'date',
        description: 'Date of creation of this document',
    },
    updatedAt: {
        bsonType: 'date',
        description: 'Date of last update of this document',
    },
    isDeleted: {
        bsonType: 'bool',
        description: 'Flag to indicate if this document is deleted',
    },
}
type IndexKey = { [key: string]: number };

type Index = {
  key: IndexKey;
  name: string;
};


const baseIndexes = (prefix: string): Index[]=>{
    return [
        
          {  key: {
                createdAt: -1,
            },
                name: `${prefix}_createdAt index`,
        },
            {
                key: {  updatedAt: -1},
                name: `${prefix}_updatedAt index`,
        },
            {
                key: {  isDeleted: -1},
                name: `${prefix}_isDeleted index`,
        },
    ]
}


const baseDefaults = ()=>({
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
})


const ensureCollection =async ({db, collectionName, validator, indexes})=>{
    const collections = await db.listCollections({name: collectionName}).toArray();

    if(collections.length === 0){
        console.log(`Creating collection ${collectionName}`);
        await db.createCollection(collectionName, {
            validator,
        })
    }else{
        console.log(`Collection ${collectionName} already exists`);
        db.command({
            collMod: collectionName,
            validator,
        })  
    }

    await db.command({
        createIndexes: collectionName,
        indexes: [...indexes, ...baseIndexes(collectionName)],
    })

    console.log(`Collection ${collectionName} is ready`);
}


export {
    baseDefaults, baseSchema, ensureCollection
};
