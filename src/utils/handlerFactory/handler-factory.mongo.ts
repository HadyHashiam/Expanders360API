import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { RESOURCE_CONSTRAINTS } from '../constant';
import { ApiFeaturesMongo } from '../apiFeature/api-features.mongo';

export const getAll = <T>(model: Model<T>, resourceName: keyof typeof RESOURCE_CONSTRAINTS) =>
  async (query: any) => {
    const searchFields = RESOURCE_CONSTRAINTS[resourceName].searchableFields.map(field => typeof field === 'string' ? field : field.field);
    const features = new ApiFeaturesMongo(model.find(), query)
      .filter()
      .search(searchFields)
      .sort()
      .limitFields();
    const filteredCount = await model.countDocuments(features.getFilter());
    features.paginate(filteredCount);
    const docs = await features.getQuery();
    return {
      status: 'success',
      results: filteredCount,
      pagination: features.getPagination(),
      data: docs,
    };
  };

export const getOne = <T>(model: Model<T>) =>
  async (id: string) => {
    const doc = await model.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  };

export const createOne = <T>(model: Model<T>) =>
  async (data: any) => {
    return await model.create(data);
  };

export const updateOne = <T>(model: Model<T>) =>
  async (id: string, data: any) => {
    const doc = await model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  };

export const deleteOne = <T>(model: Model<T>) =>
  async (id: string) => {
    const doc = await model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  };