<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate aria-label="Loading departments" />
    <v-alert v-if="error" type="error" role="alert">
      {{ error }}
      <v-btn text @click="loadDepartments">Retry</v-btn>
    </v-alert>
    <v-row>
      <v-col v-for="department in departments" :key="department.departmentId" cols="12" sm="6">
        <button type="button" class="department serif white hover" @click="openDepartment(department)">
          <span class="box serif bold larger">{{ department.displayName }}</span>
        </button>
      </v-col>
    </v-row>
    <v-dialog v-model="isDialogOpen" fullscreen transition="dialog-bottom-transition">
      <ArtworkCollection v-if="isDialogOpen" :query="collectionQuery" @close="isDialogOpen = false" />
    </v-dialog>
  </div>
</template>

<script>
import { museumApi, createRequest, isCancelled } from "@/services/museum";
import ArtworkCollection from "@/components/collection/ArtworkCollection.vue";

export default {
  name: "ExplorerView",
  components: { ArtworkCollection },
  data: () => ({
    departments: [],
    loading: false,
    error: "",
    isDialogOpen: false,
    selectedDepartment: null,
    request: null,
  }),
  computed: {
    collectionQuery() {
      if (!this.selectedDepartment) return null;
      return {
        keyword: this.selectedDepartment.displayName,
        departmentId: this.selectedDepartment.departmentId,
      };
    },
  },
  created() {
    this.loadDepartments();
  },
  beforeDestroy() {
    if (this.request) this.request.cancel();
  },
  methods: {
    async loadDepartments() {
      this.request = createRequest();
      this.loading = true;
      this.error = "";
      try {
        this.departments = await museumApi.getDepartments({ cancelToken: this.request.token });
      } catch (error) {
        if (!isCancelled(error)) this.error = "Unable to load departments. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    openDepartment(department) {
      this.selectedDepartment = department;
      this.isDialogOpen = true;
    },
  },
};
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
