import { invariant } from '@lens-protocol/shared-kernel';

import { TransactionKind } from '../../entities';
import {
  DelegableProtocolCallUseCase,
  IProtocolCallGateway,
  IProtocolCallPresenter,
} from '../transactions/DelegableProtocolCallUseCase';
import { CollectPolicy, Media, ContentFocus, ReferencePolicy, Locale } from './types';

export type CreateCommentRequest = {
  publicationId: string;
  content?: string;
  contentFocus: ContentFocus;
  media?: Media[];
  reference: ReferencePolicy;
  collect: CollectPolicy;
  profileId: string;
  kind: TransactionKind.CREATE_COMMENT;
  locale: Locale;
  delegate: boolean;
};

export type ICommentCallGateway = IProtocolCallGateway<CreateCommentRequest>;

export type ICreateCommentPresenter = IProtocolCallPresenter;

export class CreateComment extends DelegableProtocolCallUseCase<CreateCommentRequest> {
  async execute(request: CreateCommentRequest) {
    invariant(request.media || request.content, 'One of post media or content is required');

    await super.execute(request);
  }
}
