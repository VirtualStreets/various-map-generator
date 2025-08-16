import { type AxiosInstance, type AxiosResponse } from "axios";
import { create } from "xmlbuilder2";
import { HttpClient } from "@/mapycz/HttpClient";
import {
  PlaceType,
  PanoramaType,
  PanoramaNeighbourType,
  MapyCzApiException,
} from "@/mapycz/types";

export class MapyCzApi {
  static API_URL = "https://cors-proxy.ac4.stocc.dev/https://pro.mapy.cz";
  static API_URL_PUBLIC = "https://cors-proxy.ac4.stocc.dev/https://api.mapy.cz";
  private static API_ENDPOINT_PANORAMA = "/panorpc";
  private static API_METHOD_DETAIL = "detail";
  private static API_METHOD_GET_NEIGHBOURS = "getneighbours";
  private static API_METHOD_LOOKUP_BOX = "lookupbox";
  private static API_METHOD_GETBEST = "getbest";

  private client: AxiosInstance | null = null;

  private getClient(): AxiosInstance {
    if (this.client === null) {
      this.client = HttpClient.getDefault();
    }
    return this.client;
  }

  /**
   * Set custom client, which will be used to send requests.
   */
  public setClient(client: AxiosInstance): this {
    this.client = client;
    return this;
  }

  public async loadPoiDetails(source: string, id: number): Promise<PlaceType> {
    const xmlBody = this.generateXmlRequest(MapyCzApi.API_METHOD_DETAIL, source, id);
    const response = await this.makeApiRequest("/poi", xmlBody);
    return PlaceType.cast(response.poi);
  }

  public async loadPanoramaDetails(id: number): Promise<PanoramaType> {
    const body = this.generateXmlRequest(MapyCzApi.API_METHOD_DETAIL, id);
    const response = await this.makeApiRequest(MapyCzApi.API_ENDPOINT_PANORAMA, body);
    return PanoramaType.cast(response.result);
  }

  public async loadPanoramaNeighbours(id: number): Promise<PanoramaNeighbourType[]> {
    const body = this.generateXmlRequest(MapyCzApi.API_METHOD_GET_NEIGHBOURS, id);
    const response = await this.makeApiRequest(MapyCzApi.API_ENDPOINT_PANORAMA, body);
    return PanoramaNeighbourType.createFromResponse(response);
  }

  public async loadLookupBox(
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
    options: any
  ): Promise<PlaceType[]> {
    const xmlBody = this.generateXmlRequest(
      MapyCzApi.API_METHOD_LOOKUP_BOX,
      lon1,
      lat1,
      lon2,
      lat2,
      options
    );
    const response = await this.makeApiRequest("/poi", xmlBody);
    const places: PlaceType[] = [];
    for (const poi of response.poi) {
      places.push(PlaceType.cast(poi));
    }
    return places;
  }

  public async loadPanoramaGetBest(
    lon: number,
    lat: number,
    radius: number = 50
  ): Promise<PanoramaType | null> {
    try {
      const xmlBody = this.generateXmlRequest(
        MapyCzApi.API_METHOD_GETBEST,
        parseFloat(lon.toString()),
        parseFloat(lat.toString()),
        parseFloat(radius.toString())
      );
      const response = await this.makeApiRequest(MapyCzApi.API_ENDPOINT_PANORAMA, xmlBody);
      return PanoramaType.cast(response.result);
    } catch (exception: any) {
      if (
        exception instanceof MapyCzApiException &&
        (exception.code === 404 || exception.message.startsWith("No best panorama for point"))
      ) {
        return null;
      }
      throw exception;
    }
  }

  private async makeApiRequest(endpoint: string, xmlBody: string): Promise<any> {
    const url = `${MapyCzApi.API_URL}${endpoint}`;
    const headers = {
      "Accept": "application/json",
      "Content-Type": "text/xml"
    };
    const response: AxiosResponse = await this.getClient().post(url, xmlBody, { headers });
    const content = response.data;
    if (content.failure && content.failureMessage) {
      throw new MapyCzApiException(content.failureMessage, content.failure);
    }
    if (content.status === 200 && String(content.statusMessage).toLowerCase() === "ok") {
      return content;
    } else {
      throw new MapyCzApiException(content.statusMessage, content.status);
    }
  }

  public async makePublicApiRequest(endpoint: string, parameters: Record<string, any> = {}): Promise<any> {
    let url = `${MapyCzApi.API_URL_PUBLIC}${endpoint}`;
    if (Object.keys(parameters).length > 0) {
      const params = new URLSearchParams(parameters);
      url += `?${params.toString()}`;
    }
    const response: AxiosResponse = await this.getClient().get(url);
    // Here you may want to parse XML: response.data is XML string
    return response.data;
  }

  /**
   * Generate XML request for API.
   */
  private generateXmlRequest(methodName: string, ...params: any[]): string {
    const root = create({ version: "1.0", encoding: "utf-8" })
      .ele("methodCall")
      .ele("methodName").txt(methodName).up()
      .ele("params");
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const paramElem = root.ele("param").ele("value");
      MapyCzApi.fillXmlParam(paramElem, param, methodName, i);
      paramElem.up().up();
    }
    return root.end({ prettyPrint: false });
  }

  /**
   * Fill XML structure for a parameter.
   */
  private static fillXmlParam(xml: any, param: any, methodName?: string, paramIndex?: number): void {
    if (typeof param === "number") {
      const shouldUseDouble = methodName === MapyCzApi.API_METHOD_GETBEST ||
        (methodName === MapyCzApi.API_METHOD_LOOKUP_BOX && paramIndex !== undefined && paramIndex < 4);

      if (shouldUseDouble) {
        xml.ele("double").txt(String(param));
      } else {
        xml.ele("int").txt(String(Math.floor(param)));
      }
    } else if (typeof param === "string") {
      xml.ele("string").txt(param);
    } else if (typeof param === "object" && param !== null && !Array.isArray(param)) {
      const struct = xml.ele("struct");
      for (const key in param) {
        const member = struct.ele("member");
        member.ele("name").txt(key);
        const value = member.ele("value");
        MapyCzApi.fillXmlParam(value, param[key]);
      }
    } else {
      throw new Error(`Unexpected type "${typeof param}" of parameter.`);
    }
  }
}