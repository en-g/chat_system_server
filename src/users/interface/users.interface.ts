export interface UserLogin {
  username: string
  password: string
}

export interface PersonalInfoId {
  userId: string
}

export interface PersonalInfo {
  userId: number
  nickname: string
  avatarUrl: string
  sex: string
  birthday: string
  signature: string
  email: string
}
