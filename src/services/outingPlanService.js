import api from './api';

export const outingPlanService = {
  createPlan: async (planData) => {
    const response = await api.post('/outing-plans/create', planData);
    return response.data;
  },

  getMyPlans: async () => {
    const response = await api.get('/outing-plans/my-plans');
    return response.data;
  },
};
