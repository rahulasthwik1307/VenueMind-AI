export interface MapService {
  getStadiumLayout: () => Promise<any>;
  getHeatmapData: () => Promise<any>;
}

export const mapService: MapService = {
  getStadiumLayout: async () => {
    return Promise.resolve({ zones: [] });
  },
  getHeatmapData: async () => {
    return Promise.resolve({ dataPoints: [] });
  },
};
