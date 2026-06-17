import api from './api';

export const movieService = {
  discoverMovies: async (filters) => {
    const response = await api.post('/movies/discover', filters);
    return response.data;
  },

  getWatchProviders: async (id) => {
    const response = await api.get(`/movies/providers/${id}`);
    return response.data;
  },
};
