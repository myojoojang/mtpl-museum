import type {
	Artwork,
	CancellationCheck,
	Department,
	MuseumApi,
	MuseumHttpClient,
} from "../types/museum";

interface DepartmentsResponse {
	departments: Department[] | null;
}
interface SearchResponse {
	objectIDs: number[] | null;
	total: number;
}

export function createMuseumApi(
	client: MuseumHttpClient,
	isCancelled: CancellationCheck = () => false,
): MuseumApi {
	return {
		async getDepartments(options = {}) {
			const { data } = await client.get<DepartmentsResponse>(
				"/v1/departments",
				options,
			);
			return data.departments || [];
		},
		async search({ keyword, departmentId, offset, limit, ...options }) {
			const params: {
				hasImages: boolean;
				offset: number;
				limit: number;
				q?: string;
				departmentId?: number;
				isHighlight?: boolean;
			} = { hasImages: true, offset, limit };
			if (typeof departmentId === "number") {
				params.departmentId = departmentId;
			} else {
				params.q = keyword;
				params.isHighlight = true;
			}
			const { data } = await client.get<SearchResponse>("/v1.1/search", {
				...options,
				params,
			});
			return { ids: data.objectIDs || [], total: data.total || 0 };
		},
		async getArtworks(ids, options = {}) {
			const results: Array<Artwork | undefined> = new Array(ids.length);
			let cursor = 0;
			let failed = 0;
			async function worker(): Promise<void> {
				while (cursor < ids.length) {
					const index = cursor++;
					try {
						const { data } = await client.get<Artwork>(
							`/v1/objects/${ids[index]}`,
							options,
						);
						results[index] = data;
					} catch (error) {
						if (isCancelled(error)) throw error;
						failed += 1;
					}
				}
			}
			await Promise.all(
				Array.from({ length: Math.min(5, ids.length) }, worker),
			);
			return {
				artworks: results.filter(
					(artwork): artwork is Artwork => artwork !== undefined,
				),
				failed,
			};
		},
	};
}
