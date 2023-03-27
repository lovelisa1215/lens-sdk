import { Post, FragmentPost, ReactionTypes } from '@lens-protocol/api-bindings';
import {
  createMockApolloCache,
  mockPostFragment,
  mockPublicationStatsFragment,
} from '@lens-protocol/api-bindings/mocks';
import { ReactionType } from '@lens-protocol/domain/entities';
import { mockReactionRequest } from '@lens-protocol/domain/mocks';
import { ReactionRequest } from '@lens-protocol/domain/use-cases/publications';

import { PublicationCacheManager } from '../../../transactions/adapters/PublicationCacheManager';
import { ReactionPresenter } from '../ReactionPresenter';

function setupTestScenario({ post, request }: { post: Post; request: ReactionRequest }) {
  const apolloCache = createMockApolloCache();

  apolloCache.writeFragment({
    id: apolloCache.identify({
      __typename: 'Post',
      id: request.publicationId,
    }),
    fragment: FragmentPost,
    fragmentName: 'Post',
    data: post,
  });

  const publicationCacheManager = new PublicationCacheManager(apolloCache);
  const presenter = new ReactionPresenter(publicationCacheManager);

  return {
    presenter,

    get updatedPostFragment() {
      return apolloCache.readFragment({
        id: apolloCache.identify({
          __typename: 'Post',
          id: post.id,
        }),
        fragment: FragmentPost,
        fragmentName: 'Post',
      });
    },
  };
}

describe(`Given the ${ReactionPresenter.name}`, () => {
  describe(`when the "${ReactionPresenter.prototype.add.name}" method is invoked`, () => {
    it(`should update apollo cache with added upvote reaction`, async () => {
      const post = mockPostFragment({
        reaction: null,
        stats: mockPublicationStatsFragment({ totalUpvotes: 1 }),
      });
      const request = mockReactionRequest({
        publicationId: post.id,
      });

      const scenario = setupTestScenario({
        post,
        request,
      });

      await scenario.presenter.add(request);

      expect(scenario.updatedPostFragment).toEqual(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({
            totalUpvotes: post.stats.totalUpvotes + 1,
          }),
          reaction: ReactionTypes.Upvote,
        }),
      );
    });

    it(`should update apollo cache with added downvote reaction`, async () => {
      const post = mockPostFragment({
        reaction: null,
        stats: mockPublicationStatsFragment({ totalDownvotes: 1 }),
      });

      const request = mockReactionRequest({
        publicationId: post.id,
        reactionType: ReactionType.DOWNVOTE,
      });

      const scenario = setupTestScenario({
        post,
        request,
      });

      await scenario.presenter.add(request);

      expect(scenario.updatedPostFragment).toEqual(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({
            totalDownvotes: post.stats.totalDownvotes + 1,
          }),
          reaction: ReactionTypes.Downvote,
        }),
      );
    });

    it(`should update apollo cache with added reaction update the stats based on the previous reaction`, async () => {
      const post = mockPostFragment({
        reaction: ReactionTypes.Upvote,
        stats: mockPublicationStatsFragment({
          totalUpvotes: 1,
          totalDownvotes: 0,
        }),
      });
      const request = mockReactionRequest({
        publicationId: post.id,
        reactionType: ReactionType.DOWNVOTE,
      });

      const scenario = setupTestScenario({
        post,
        request,
      });

      await scenario.presenter.add(request);

      expect(scenario.updatedPostFragment).toEqual(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({
            totalUpvotes: 0,
            totalDownvotes: 1,
          }),
          reaction: ReactionTypes.Downvote,
        }),
      );
    });
  });

  describe(`when the "${ReactionPresenter.prototype.remove.name}" method is invoked`, () => {
    it(`should update apollo cache with removed reaction`, async () => {
      const post = mockPostFragment({
        reaction: ReactionTypes.Upvote,
        stats: mockPublicationStatsFragment({ totalUpvotes: 1 }),
      });
      const request = mockReactionRequest({
        publicationId: post.id,
      });

      const scenario = setupTestScenario({
        post,
        request,
      });

      await scenario.presenter.remove(request);

      expect(scenario.updatedPostFragment).toEqual(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({
            totalUpvotes: post.stats.totalUpvotes - 1,
          }),
          reaction: null,
        }),
      );
    });
  });
});
