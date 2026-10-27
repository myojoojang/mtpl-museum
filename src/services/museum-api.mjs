export function createMuseumApi(client, isCancelled = () => false) {
  return {
    async getDepartments(options = {}) {
      const { data } = await client.get('/departments', options);
      return data.departments || [];
    },
    async search({ keyword = '', departmentId, ...options } = {}) {
      const params = { hasImages: true, q: keyword };
      if (departmentId != null) params.departmentId = departmentId;
      else params.isHighlight = true;
      const { data } = await client.get('/search', { ...options, params });
      return { ids: data.objectIDs || [], total: data.total || 0 };
    },
    async getArtworks(ids, options = {}) {
      const results = new Array(ids.length);
      let cursor = 0;
      let failed = 0;
      async function worker() {
        while (cursor < ids.length) {
          const index = cursor++;
          try {
            const { data } = await client.get(`/objects/${ids[index]}`, options);
            results[index] = data;
          } catch (error) {
            if (isCancelled(error)) throw error;
            failed += 1;
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(5, ids.length) }, worker));
      return { artworks: results.filter(Boolean), failed };
    },
  };
}
