import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import path from 'path';

@Injectable()
export class UserService {

  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async editProfile(id: string, userData: UpdateUserDto) {
    return await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .select('-password -hashRt')
      .lean();
  }

  async deleteProfile(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }
  async currentUser(id: string) {
    return await this.userModel.findById(id)
  }

  async getOwnMatchs(id: string) {
    return await this.userModel.findById(id, "ownMatchs")
      .populate({ path: "ownMatchs", select: "-createdAt -updatedAt", populate: [{ path: "terrainId", select: "-matchsIn -managerId -createdAt -updatedAt" }, { path: "playersOfMatch", select: "isAccepted userId", populate: { path: "userId", select: "name phone email" } }] })
      .exec();
  }


  async getJointedMatches(id: string) {
    return await this.userModel.findById(id, "jointedMatch").populate({ path: "jointedMatch", select: "-createdAt -updatedAt", populate: { path: "matchId", select: "-createdAt -updatedAt" } }).exec();
  }



}
