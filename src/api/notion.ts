import { apiClient } from "./client";
import {
  NotionUserType,
  LoadPageChunkData,
  CollectionData,
  NotionSearchParamsType,
  NotionSearchResultsType,
} from "./types";

const loadPageChunkBody = {
  limit: 100,
  cursor: { stack: [] },
  chunkNumber: 0,
  verticalColumns: false,
};

export const fetchPageById = async (pageId: string, notionToken?: string) => {
  const response = await apiClient.post<LoadPageChunkData>("loadPageChunk", {
    pageId,
    ...loadPageChunkBody,
  });

  return response.data;
};

const queryCollectionBody = {
  loader: {
    type: "reducer",
    reducers: {
      collection_group_results: {
        type: "results",
        limit: 999,
        loadContentCover: true,
      },
      "table:uncategorized:title:count": {
        type: "aggregation",
        aggregation: {
          property: "title",
          aggregator: "count",
        },
      },
    },
    searchQuery: "",
    userTimeZone: "Europe/Vienna",
  },
};

export const fetchTableData = async (
  collectionId: string,
  collectionViewId: string
) => {
  const response = await apiClient.post<CollectionData>("queryCollection", {
    collection: {
      id: collectionId,
    },
    collectionView: {
      id: collectionViewId,
    },
    ...queryCollectionBody,
  });

  return response.data;
};

export const fetchNotionUsers = async (userIds: string[]) => {
  const users = (
    await apiClient.post<{ results: NotionUserType[] }>("getRecordValues", {
      requests: userIds.map((id) => ({ id, table: "notion_user" })),
    })
  ).data;

  if (users && users.results) {
    return users.results.map((u) => {
      const user = {
        id: u.value.id,
        firstName: u.value.given_name,
        lastLame: u.value.family_name,
        fullName: u.value.given_name + " " + u.value.family_name,
        profilePhoto: u.value.profile_photo,
      };
      return user;
    });
  }
  return [];
};

export const fetchBlocks = async (blockList: string[]) => {
  const response = await apiClient.post<LoadPageChunkData>("syncRecordValues", {
    requests: blockList.map((id) => ({
      id,
      table: "block",
      version: -1,
    })),
  });

  return response.data;
};

export const fetchNotionSearch = async (params: NotionSearchParamsType) => {
  // TODO: support other types of searches
  const response = apiClient.post<{ results: NotionSearchResultsType }>(
    "search",
    {
      type: "BlocksInAncestor",
      source: "quick_find_public",
      ancestorId: params.ancestorId,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: true,
        isNavigableOnly: true,
        requireEditPermissions: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
        ...params.filters,
      },
      sort: "Relevance",
      limit: params.limit || 20,
      query: params.query,
    }
  );
};
