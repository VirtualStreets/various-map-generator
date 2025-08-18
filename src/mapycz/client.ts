import axios, { type AxiosInstance } from "axios";

export class HttpClient {
  static getDefault(): AxiosInstance {
    return axios.create();
  }
}