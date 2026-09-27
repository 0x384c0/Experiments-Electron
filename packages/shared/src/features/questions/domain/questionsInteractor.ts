import { injectable, inject } from "../../../shared/lib/di";
import { QuestionsRepository } from "./questionsRepository";
import type { AnswerModel, Page, QuestionDetailModel, QuestionModel } from "./models";

@injectable()
export class QuestionsInteractor {
  constructor(@inject(QuestionsRepository) private readonly repository: QuestionsRepository) {}

  getQuestions(page: number): Promise<Page<QuestionModel>> {
    return this.repository.getQuestions(page);
  }

  getQuestion(id: number): Promise<QuestionDetailModel> {
    return this.repository.getQuestion(id);
  }

  getAnswers(questionId: number, page: number): Promise<Page<AnswerModel>> {
    return this.repository.getAnswers(questionId, page);
  }
}
