<template>
  <div>
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="white"
      aria-label="Loading departments"
    />
    <v-alert
      v-if="errorMessage"
      type="error"
      outlined
      dark
      role="alert"
    >
      <p>{{ errorMessage }}</p>
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
      <ArtworkCollection
        v-if="isDialogOpen && collectionQuery"
        :query="collectionQuery"
        @close="isDialogOpen = false"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { CollectionQuery, Department } from '@/types/museum';
import { museumApi } from '@/services/museum';
import ArtworkCollection from '@/components/collection/ArtworkCollection.vue';

interface ExplorerState {
  departments: Department[];
  isLoading: boolean;
  errorMessage: string;
  isDialogOpen: boolean;
  selectedDepartment: Department | null;
}

export default defineComponent({
  name: 'ExplorerView',
  components: { ArtworkCollection },
  data: (): ExplorerState => {
    return {
      departments: [],
      isLoading: false,
      errorMessage: '',
      isDialogOpen: false,
      selectedDepartment: null,
    };
  },
  computed: {
    collectionQuery(): CollectionQuery | null {
      if (!this.selectedDepartment) {
        return null;
      }

      return {
        keyword: this.selectedDepartment.displayName,
        departmentId: this.selectedDepartment.departmentId,
      };
    },
  },
  created() {
    this.loadDepartments();
  },
  methods: {
    async loadDepartments() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        this.departments = await museumApi.getDepartments();
      } catch (error) {
        this.errorMessage = 'We couldn’t load the departments. Please try again.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    openDepartment(department: Department) {
      this.selectedDepartment = department;
      this.isDialogOpen = true;
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
</style>
