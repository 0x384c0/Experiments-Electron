export interface OwnerModel {
  displayName: string;
  profileImage: string;
  link: string;
}

export interface QuestionModel {
  id: number;
  title: string;
  tags: string[];
  score: number;
  answerCount: number;
  isAnswered: boolean;
  creationDate: number;
  link: string;
  owner: OwnerModel;
}

export interface QuestionDetailModel extends QuestionModel {
  body: string;
}

export interface AnswerModel {
  id: number;
  score: number;
  isAccepted: boolean;
  creationDate: number;
  body: string;
  owner: OwnerModel;
}

export interface Page<T> {
  items: T[];
  hasMore: boolean;
}
