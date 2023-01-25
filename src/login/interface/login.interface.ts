export interface LoginInfo {
  username: string
  password: string
}

export interface PassInfo {
  email: string
  username: string
  newPass: string
  verificationCode?: string
}

export interface RegisterInfo {
  email: string
  username: string
  password: string
  verificationCode?: string
}

export interface RegisterUserInfo {
  userId: number
  nickname: string
  avatarUrl: string
  sex: string
  birthday: Date
}

export interface RegisterUserRandomInfo {
  userId: number
}
