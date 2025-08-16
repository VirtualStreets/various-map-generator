// Type abstract class (already provided above)
export abstract class Type {
  mark: { lat: number; lon: number ; alt:number;} | undefined;

  getLat(): number {
    if (!this.mark) throw new Error('No mark property');
    return this.mark.lat;
  }

  getLon(): number {
    if (!this.mark) throw new Error('No mark property');
    return this.mark.lon;
  }

  getAlt(): number {
    if (!this.mark) throw new Error('No mark property');
    return this.mark.alt;
  }

}

// PanoramaType
export class PanoramaType extends Type {
  // Optionally add Panorama-specific properties here
  static cast(data: any): PanoramaType {
    const obj = new PanoramaType();
    Object.assign(obj, data);
    return obj;
  }
}

// PlaceType
export class PlaceType extends Type {
  // Optionally add Place-specific properties here
  static cast(data: any): PlaceType {
    const obj = new PlaceType();
    Object.assign(obj, data);
    return obj;
  }
}

// PanoramaNeighbourType (as previously provided)
export class PanoramaNeighbourType extends Type {
  angle!: number;
  near?: PanoramaType | null;
  far?: PanoramaType | null;

  static createFromResponse(response: any): PanoramaNeighbourType[] {
    const neighbours: PanoramaNeighbourType[] = [];
    if (
      response?.result?.neighbours &&
      Array.isArray(response.result.neighbours)
    ) {
      for (const neighbourRaw of response.result.neighbours) {
        const neighbour = new PanoramaNeighbourType();
        for (const key in neighbourRaw) {
          let value = neighbourRaw[key];
          if (key === "far" || key === "near") {
            if (value && Object.keys(value).length > 0) {
              value = PanoramaType.cast(value);
            } else {
              value = null;
            }
          }
          (neighbour as any)[key] = value;
        }
        neighbours.push(neighbour);
      }
    }
    return neighbours;
  }

  getLat(): number {
    if (this.near) {
      return this.near.getLat();
    } else if (this.far) {
      return this.far.getLat();
    } else {
      throw new Error("Can't get latitude - no near or far panorama is available");
    }
  }

  getLon(): number {
    if (this.near) {
      return this.near.getLon();
    } else if (this.far) {
      return this.far.getLon();
    } else {
      throw new Error("Can't get longitude - no near or far panorama is available");
    }
  }

  setProperty(name: string, value: any): void {
    throw new Error(
      `Property "${this.constructor.name}$${name}" is not predefined.`
    );
  }
}


// Exception
export class MapyCzApiException extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}