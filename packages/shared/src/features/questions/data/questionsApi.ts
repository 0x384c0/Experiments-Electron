import { injectable } from "../../../shared/lib/di";

// no API key, no signup -- https://api.stackexchange.com, anonymous tier
// (300 requests/day, shared per IP, plenty for a reference app)
const BASE_URL = "https://api.stackexchange.com/2.2";
const SITE = "stackoverflow";
const TAG = "flutter";

export interface OwnerDto {
  display_name: string;
  profile_image: string;
  link: string;
}

export interface QuestionDto {
  question_id: number;
  title: string;
  tags: string[];
  score: number;
  answer_count: number;
  is_answered: boolean;
  creation_date: number;
  link: string;
  owner: OwnerDto;
  // only present when the request includes filter=withbody
  body?: string;
}

export interface AnswerDto {
  answer_id: number;
  question_id: number;
  score: number;
  is_accepted: boolean;
  creation_date: number;
  body: string;
  owner: OwnerDto;
}

export interface StackExchangeResponseDto<T> {
  items: T[];
  has_more: boolean;
  quota_remaining: number;
}

@injectable()
export class QuestionsApiClient {
  getQuestions(page: number, pageSize: number): Promise<StackExchangeResponseDto<QuestionDto>> {
    const url = new URL(`${BASE_URL}/questions`);
    url.searchParams.set("order", "desc");
    url.searchParams.set("sort", "creation");
    url.searchParams.set("site", SITE);
    url.searchParams.set("tagged", TAG);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pagesize", String(pageSize));
    return this.get(url);
  }

  getQuestion(id: number): Promise<StackExchangeResponseDto<QuestionDto>> {
    const url = new URL(`${BASE_URL}/questions/${id}`);
    url.searchParams.set("site", SITE);
    url.searchParams.set("filter", "withbody");
    return this.get(url);
  }

  getAnswers(
    questionId: number,
    page: number,
    pageSize: number,
  ): Promise<StackExchangeResponseDto<AnswerDto>> {
    const url = new URL(`${BASE_URL}/questions/${questionId}/answers`);
    url.searchParams.set("site", SITE);
    url.searchParams.set("filter", "withbody");
    url.searchParams.set("order", "desc");
    url.searchParams.set("sort", "votes");
    url.searchParams.set("page", String(page));
    url.searchParams.set("pagesize", String(pageSize));
    return this.get(url);
  }

  private async get<T>(url: URL): Promise<StackExchangeResponseDto<T>> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`stack exchange api error: ${response.status}`);
    }
    return response.json() as Promise<StackExchangeResponseDto<T>>;
  }
}
