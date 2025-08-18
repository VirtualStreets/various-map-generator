export interface MapillaryImageMetadata {
    id: string;
    altitude?: number;
    atomic_scale?: number;
    camera_parameters?: number[];
    camera_type?: 'perspective' | 'fisheye' | 'equirectangular' | 'spherical';
    captured_at?: number;
    compass_angle?: number;
    computed_altitude?: number;
    computed_compass_angle?: number;
    computed_geometry?: {
        type: 'Point';
        coordinates: [number, number];
    };
    computed_rotation?: number;
    creator?: {
        username: string;
        id: string;
    };
    exif_orientation?: number;
    geometry?: {
        type: 'Point';
        coordinates: [number, number];
    };
    height?: number;
    is_pano?: boolean;
    make?: string;
    model?: string;
    thumb_256_url?: string;
    thumb_1024_url?: string;
    thumb_2048_url?: string;
    thumb_original_url?: string;
    merge_cc?: number;
    mesh?: {
        id: string;
        url: string;
    };
    sequence?: string;
    sfm_cluster?: {
        id: string;
        url: string;
    };
    width?: number;
    detections?: {
        data: Array<{
            value: string;
            geometry: string;
            id: string;
        }>;
    };
}

export interface MapillarySearchOptions {
    bbox?: [number, number, number, number]; // [west, south, east, north]
    radius?: number; // 半径，单位米，与center配合使用
    center?: [number, number]; // [longitude, latitude]
    make?: string; // 相机制造商
    model?: string; // 相机型号
    is_pano?: boolean; // 是否为全景图
    captured_at?: {
        start?: number; // 时间戳
        end?: number; // 时间戳
    };
    sequence_id?: string; // 序列ID
    creator_id?: string; // 创建者ID
    limit?: number; // 返回结果数量限制，默认1000
    fields?: string[]; // 需要返回的字段
}

export interface MapillarySearchResponse {
    data: MapillaryImageMetadata[];
    paging?: {
        cursors?: {
            before?: string;
            after?: string;
        };
        next?: string;
        previous?: string;
    };
}

export class MapillaryAPI {
    private readonly baseUrl = 'https://graph.mapillary.com';
    private readonly accessToken: string;

    constructor() {
        this.accessToken = 'MLY|4756369651124824|daee50b6cb15570a90b6a151bbd97bf3';
    }

    /**
     * 根据图片ID获取图片元数据
     * @param imageId 图片ID
     * @param fields 需要返回的字段，默认返回常用字段
     */
    async getImageById(
        imageId: string, 
        fields?: string[]
    ): Promise<MapillaryImageMetadata> {
        const defaultFields = [
            'id', 
            'computed_geometry', 
            'computed_altitude',
            'geometry', 
            'captured_at', 
            'is_pano', 
            'make', 
            'model',
            'thumb_2048_url',
            'compass_angle',
            'computed_compass_angle'
        ];
        
        const fieldsParam = fields ? fields.join(',') : defaultFields.join(',');
        const url = `${this.baseUrl}/${imageId}?access_token=${this.accessToken}&fields=${fieldsParam}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Error fetching image ${imageId}: ${error}`);
        }
    }

    /**
     * 根据经纬度和半径搜索图片
     * @param longitude 经度
     * @param latitude 纬度
     * @param radius 搜索半径（米）
     * @param options 其他搜索选项
     */
    async searchImagesByLocation(
        longitude: number,
        latitude: number,
        radius: number,
        options: Omit<MapillarySearchOptions, 'center' | 'radius'> = {}
    ): Promise<MapillarySearchResponse> {
        return this.searchImages({
            ...options,
            center: [longitude, latitude],
            radius
        });
    }

    /**
     * 根据边界框搜索图片
     * @param bbox 边界框 [west, south, east, north]
     * @param options 其他搜索选项
     */
    async searchImagesByBbox(
        bbox: [number, number, number, number],
        options: Omit<MapillarySearchOptions, 'bbox'> = {}
    ): Promise<MapillarySearchResponse> {
        return this.searchImages({
            ...options,
            bbox
        });
    }

    /**
     * 通用图片搜索方法
     * @param options 搜索选项
     */
    async searchImages(options: MapillarySearchOptions = {}): Promise<MapillarySearchResponse> {
        const defaultFields = [
            'id',
            'computed_geometry',
            'computed_altitude',
            'geometry', 
            'captured_at',
            'is_pano',
            'make',
            'model',
            'thumb_2048_url',
            'compass_angle',
            'computed_compass_angle',
            'sequence',
            'mesh',
            'merge_cc'
        ];

        const params = new URLSearchParams();
        params.append('access_token', this.accessToken);
        
        // 处理位置参数
        if (options.bbox) {
            params.append('bbox', options.bbox.join(','));
        } else if (options.center && options.radius) {
            // 将中心点和半径转换为bbox
            const bbox = this.radiusToBbox(options.center[1], options.center[0], options.radius);
            params.append('bbox', bbox.join(','));
        }

        // 处理其他筛选参数
        if (options.make) params.append('make', options.make);
        if (options.model) params.append('model', options.model);
        if (options.is_pano !== undefined) params.append('is_pano', options.is_pano.toString());
        if (options.sequence_id) params.append('sequence_id', options.sequence_id);
        if (options.creator_id) params.append('creator_id', options.creator_id);
        if (options.limit) params.append('limit', options.limit.toString());

        // 处理时间范围
        if (options.captured_at?.start) {
            params.append('start_captured_at', options.captured_at.start.toString());
        }
        if (options.captured_at?.end) {
            params.append('end_captured_at', options.captured_at.end.toString());
        }

        // 处理字段
        const fields = options.fields || defaultFields;
        params.append('fields', fields.join(','));

        const url = `${this.baseUrl}/images?${params.toString()}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to search images: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Error searching images: ${error}`);
        }
    }

    /**
     * 根据序列ID获取序列中的所有图片
     * @param sequenceId 序列ID
     * @param fields 需要返回的字段
     */
    async getImagesBySequence(
        sequenceId: string, 
        fields?: string[]
    ): Promise<MapillarySearchResponse> {
        return this.searchImages({
            sequence_id: sequenceId,
            fields: fields || ['id', 'computed_geometry', 'captured_at', 'compass_angle']
        });
    }

    /**
     * 将半径转换为边界框
     * @param lat 纬度
     * @param lon 经度  
     * @param radius 半径（米）
     */
    private radiusToBbox(lat: number, lon: number, radius: number): [number, number, number, number] {
        const latRadian = lat * Math.PI / 180;
        const degLatKm = 110.54;
        const degLonKm = 110.54 * Math.cos(latRadian);
        const deltaLat = radius / 1000 / degLatKm;
        const deltaLon = radius / 1000 / degLonKm;

        return [
            lon - deltaLon, // west
            lat - deltaLat, // south  
            lon + deltaLon, // east
            lat + deltaLat  // north
        ];
    }

    /**
     * 获取缩略图URL
     * @param imageId 图片ID
     * @param size 缩略图尺寸
     */
    getThumbnailUrl(imageId: string, size: 256 | 1024 | 2048 = 1024): string {
        return `https://images.mapillary.com/${imageId}/thumb-${size}.jpg`;
    }

    /**
     * 获取原始图片URL（需要额外权限）
     * @param imageId 图片ID  
     */
    getOriginalImageUrl(imageId: string): string {
        return `https://images.mapillary.com/${imageId}/original.jpg?access_token=${this.accessToken}`;
    }
}