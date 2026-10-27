<template>
  <div>
    <v-progress-circular
      v-if="isLoadingDepartments"
      indeterminate
      color="white"
      aria-label="Loading departments"
    />
    <v-alert
      v-if="departmentErrorMessage"
      type="error"
      outlined
      dark
      role="alert"
    >
      <p>{{ departmentErrorMessage }}</p>
      <v-btn
        outlined
        small
        @click="loadDepartments"
      >
        Try again
      </v-btn>
    </v-alert>
    <v-row>
      <v-col
        v-for="department in departments"
        :key="department.departmentId"
        cols="12"
        sm="6"
      >
        <button
          type="button"
          :disabled="isLoadingArtworks"
          class="department serif white hover"
          @click="openDepartment(department)"
        >
          <span class="box serif bold larger">{{ department.displayName }}</span>
        </button>
      </v-col>
    </v-row>
    <v-dialog
      v-model="isDialogOpen"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <CollectionList
        v-if="isDialogOpen && selectedDepartment"
        :artworks="artworks"
        :loading="isLoadingArtworks"
        :error-message="artworkErrorMessage"
        @retry="loadCollection"
      >
        <template #header>
          <div class="d-flex justify-space-between align-center pa-4">
            <div class="larger serif white--text uppercase">
              {{ selectedDepartment.displayName }}
            </div>
            <v-btn
              icon
              dark
              aria-label="Close department"
              @click="isDialogOpen = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </template>
        <template #controls>
          <div class="d-flex justify-end align-center mb-6">
            <v-select
              v-model="artworkCount"
              :items="artworkCountOptions"
              :disabled="areArtworkControlsDisabled"
              label="Artworks"
              class="artwork-count"
              rounded
              flat
              background-color="white"
              @change="loadArtworks"
            />
            <v-btn
              x-small
              fab
              class="mx-2"
              :disabled="areArtworkControlsDisabled"
              aria-label="Refresh artworks"
              @click="loadArtworks"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
        </template>
      </CollectionList>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Artwork, Department } from '@/types/collection';
import { collectionApi } from '@/services/collectionApi';
import CollectionList from '@/components/collection/CollectionList.vue';
import { sampleItems } from '@/utils/sampleItems';

interface ExplorerState {
  departments: Department[];
  artworkIds: number[];
  artworks: Artwork[];
  artworkCount: number;
  isLoadingArtworks: boolean;
  artworkErrorMessage: string;
  isLoadingDepartments: boolean;
  departmentErrorMessage: string;
  isDialogOpen: boolean;
  selectedDepartment: Department | null;
}

export default defineComponent({
  name: 'ExplorerView',
  components: { CollectionList },
  data(): ExplorerState {
    return {
      departments: [],
      artworkIds: [],
      artworks: [],
      artworkCount: 10,
      isLoadingArtworks: false,
      artworkErrorMessage: '',
      isLoadingDepartments: false,
      departmentErrorMessage: '',
      isDialogOpen: false,
      selectedDepartment: null,
    };
  },
  computed: {
    areArtworkControlsDisabled(): boolean {
      return this.isLoadingArtworks || Boolean(this.artworkErrorMessage);
    },
    artworkCountOptions(): number[] {
      return [5, 10, 20, 30, 50];
    },
  },
  created() {
    this.loadDepartments();
  },
  methods: {
    async loadDepartments(): Promise<void> {
      this.isLoadingDepartments = true;
      this.departmentErrorMessage = '';

      try {
        this.departments = await collectionApi.getDepartments();
      } catch (error) {
        this.departmentErrorMessage = 'We couldn’t load the departments. Please try again.';
        console.error(error);
      } finally {
        this.isLoadingDepartments = false;
      }
    },
    async loadCollection(): Promise<void> {
      if (!this.selectedDepartment) {
        return;
      }

      this.isLoadingArtworks = true;
      this.artworkErrorMessage = '';

      try {
        const searchResult = await collectionApi.search({
          keyword: this.selectedDepartment.displayName,
          departmentId: this.selectedDepartment.departmentId,
        });

        this.artworkIds = searchResult.ids;
        await this.loadArtworks();
      } catch (error) {
        this.artworkErrorMessage = 'We couldn’t load the collection. Please try again.';
        console.error(error);
      } finally {
        this.isLoadingArtworks = false;
      }
    },
    async loadArtworks(): Promise<void> {
      this.isLoadingArtworks = true;
      this.artworkErrorMessage = '';

      try {
        const selectedArtworkIds = sampleItems(this.artworkIds, this.artworkCount);

        this.artworks = await collectionApi.getArtworks(selectedArtworkIds);
      } catch (error) {
        this.artworkErrorMessage = 'We couldn’t load the artworks. Please try again.';
        console.error(error);
      } finally {
        this.isLoadingArtworks = false;
      }
    },
    openDepartment(department: Department): void {
      this.selectedDepartment = department;
      this.artworks = [];
      this.artworkIds = [];
      this.artworkCount = 10;
      this.isDialogOpen = true;
      this.loadCollection();
    },
  },
});
</script>

<style scoped>
.department {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100px;
  padding: 16px;
  cursor: pointer;
}

.artwork-count {
  max-width: 120px;
}
</style>
