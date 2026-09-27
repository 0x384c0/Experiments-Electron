import { injectable, inject } from "../../../shared/lib/di";
import {
  QuestionsApiClient,
  type AnswerDto,
  type OwnerDto,
  type QuestionDto,
} from "../data/questionsApi";
import type { AnswerModel, OwnerModel, Page, QuestionDetailModel, QuestionModel } from "./models";

function mapOwner(owner: OwnerDto): OwnerModel {
  return { displayName: owner.display_name, profileImage: owner.profile_image, link: owner.link };
}

// Stack Exchange's "title" is meant to render as plain text, but comes with
// HTML entities encoded in it regardless (e.g. "Xcode 27&#39;s"). A <textarea>
// only decodes entities, it can't parse/execute markup -- safe on real text.
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function mapQuestion(dto: QuestionDto): QuestionModel {
  return {
    id: dto.question_id,
    title: decodeHtmlEntities(dto.title),
    tags: dto.tags,
    score: dto.score,
    answerCount: dto.answer_count,
    isAnswered: dto.is_answered,
    creationDate: dto.creation_date,
    link: dto.link,
    owner: mapOwner(dto.owner),
  };
}

function mapAnswer(dto: AnswerDto): AnswerModel {
  return {
    id: dto.answer_id,
    score: dto.score,
    isAccepted: dto.is_accepted,
    creationDate: dto.creation_date,
    body: dto.body,
    owner: mapOwner(dto.owner),
  };
}

@injectable()
export class QuestionsRepository {
  constructor(@inject(QuestionsApiClient) private readonly api: QuestionsApiClient) {}

  async getQuestions(page: number, pageSize = 20): Promise<Page<QuestionModel>> {
    const dto = await this.api.getQuestions(page, pageSize);
    return { items: dto.items.map(mapQuestion), hasMore: dto.has_more };
  }

  async getQuestion(id: number): Promise<QuestionDetailModel> {
    const dto = await this.api.getQuestion(id);
    const item = dto.items[0];
    if (!item) {
      throw new Error(`question ${id} not found`);
    }
    return { ...mapQuestion(item), body: item.body ?? "" };
  }

  async getAnswers(questionId: number, page: number, pageSize = 20): Promise<Page<AnswerModel>> {
    const dto = await this.api.getAnswers(questionId, page, pageSize);
    return { items: dto.items.map(mapAnswer), hasMore: dto.has_more };
  }
}
