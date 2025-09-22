import httpConfig from "./httpConfig.js";

export default class BaseService {
    constructor(resource) {
        this.resource = resource;
    }

    async findAll(params = {}) {
        const response = await httpConfig.get(`/${this.resource}`, { params });
        return response.data;
    }

    async findById(id) {
        const response = await httpConfig.get(`/${this.resource}/${id}`);
        return response.data;
    }

    async create(data) {
        const response = await httpConfig.post(`/${this.resource}`, data);
        return response.data;
    }

    async update(id, data) {
        const response = await httpConfig.put(`/${this.resource}/${id}`, data);
        return response.data;
    }

    async delete(id) {
        const response = await httpConfig.delete(`/${this.resource}/${id}`);
        return response.data;
    }

    async get(endpoint, params = {}) {
        const response = await httpConfig.get(`/${this.resource}/${endpoint}`, { params });
        return response.data;
    }

    async post(endpoint, data) {
        const response = await httpConfig.post(`/${this.resource}/${endpoint}`, data);
        return response.data;
    }

    async put(endpoint, data) {
        const response = await httpConfig.put(`/${this.resource}/${endpoint}`, data);
        return response.data;
    }
}