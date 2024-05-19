// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");

import { ObjectId } from "mongodb";
import mongoose, { SortOrder } from "mongoose";

import { API_SERVER_EVENTS } from "../../../constants/event";
import ApiError from "../../../error/apiError";
import { PaginationHelper } from "../../../helpers/paginationHelper";
import { IpaginationOptions } from "../../../interface/pagination";
import { logger } from "../../../shared/logger";
import RabbitMQ from "../../../shared/rabbitMQ";
import { videoSearchableFields } from "./video.constant";
import { IHistory, IPayload, IVdieosFilterableFields } from "./video.interface";
import { Video } from "./video.model";
// // TODO: add logging

type IInsertIntoDBFromEvent = {
  data: IPayload;
};

const insertIntoDBFromEvent = async (data: IInsertIntoDBFromEvent) => {
  logger.info("insertIntoDBFromEvent", data);

  try {
    const result = await Video.create(data);
    if (result) {
      const { _id, title, author, tags } = result;
      let updateData = {
        id: _id.toString(),
        history: { status: "inserted", createdAt: Date.now() },
      };

      let UpdatedResult = await updateHistory(
        updateData.id,
        updateData.history
      );

      RabbitMQ.sendToQueue(API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT, result);
      logger.info("Result", result, "result plus updated data", UpdatedResult);
    }

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      console.error(error.message);
      // Handle the error appropriately here, e.g., by returning a meaningful value or throwing a custom error.
    } else {
      // Handle other types of errors here.
      throw error;
    }
  }
};

// // TODO: use regex or like search

const getAllVideos = async (
  filters: IVdieosFilterableFields,
  paginationOptions: IpaginationOptions
) => {
  const { searchTerm, tags, ...filtersData } = filters;

  const { limit, page, skip, sortBy, sortOrder } =
    PaginationHelper.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: videoSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  if (tags && tags.length > 0) {
    const tagsAll = Array.isArray(tags) ? tags : [tags];
    console.log("filtersData.tags", tagsAll);

    andConditions.push({
      tags: { $in: tagsAll },
    });
  }

  // add condition for status
  andConditions.push({
    status: "published",
  });

  const sortCondition: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const whereCondition = {
    ...(andConditions.length > 0 ? { $and: andConditions } : {}),
  };

  console.log("whereCondition", whereCondition);

  const result = await Video.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .populate("author", "name  email avatar");

  const totalRecords = await Video.countDocuments();

  return {
    meta: {
      page,
      limit,
      totalRecords,
    },
    data: result,
  };
};

const getMyVideos = async (
  userId: string,
  filters: IVdieosFilterableFields,
  paginationOptions: IpaginationOptions
) => {
  const { searchTerm, tags, ...filtersData } = filters;

  const { limit, page, skip, sortBy, sortOrder } =
    PaginationHelper.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: videoSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const sortCondition: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const whereCondition = {
    author: userId,
    ...(andConditions.length > 0 ? { $and: andConditions } : {}),
  };

  console.log("whereCondition", whereCondition);

  const result = await Video.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .populate("author", "name  email avatar");

  const totalRecords = await Video.countDocuments({
    author: userId,
  });

  return {
    meta: {
      page,
      limit,
      totalRecords,
    },
    data: result,
  };
};

const incrementViewCount = async (id: ObjectId) => {
  const updatedDoc = await Video.updateOne(
    {
      _id: id,
    },
    {
      $inc: {
        viewsCount: 1,
      },
    }
  );

  return updatedDoc;
};

const update = async (id: ObjectId, document: Partial<IPayload>) => {
  console.log("updating document", document);

  const updatedDoc = await Video.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        ...document,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
  console.log("updating document", updatedDoc);
  return updatedDoc;
};

const updateHistory = async (id: string, history: IHistory) => {
  console.log("updating history", history, id, "and");

  try {
    const updatedDoc = await Video.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $push: {
          history: history,
        },
      },
      {
        new: true,
        maxTimeMS: 2000,
      }
    );
    console.log("updatedDoc", updatedDoc);

    return updatedDoc;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, error.message);
  }
};

const getById = async (id: string) => {
  try {
    const result = await Video.findById(id);
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const VideoService = {
  insertIntoDBFromEvent,
  update,
  updateHistory,
  getById,
  getAllVideos,
  getMyVideos,
  incrementViewCount,
};
