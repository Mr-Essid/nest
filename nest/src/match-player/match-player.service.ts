import { HttpException, HttpStatus, Injectable, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MatchPlayer } from './entities/match-player.entity';
import { Model } from 'mongoose';
import { Match } from 'src/match/entities/match.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { MatchPlayerModule } from './match-player.module';

@Injectable()
export class MatchPlayerService {
  constructor(
    @InjectModel(MatchPlayer.name) private matchPLayerModel: Model<MatchPlayer>,
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async joinMatch(param, userId: string, isAccepted: boolean = false) {

    const isMatchExists = await this.matchModel.findById(param.matchId, "_id").exec();

    if (isMatchExists == null) {
      throw new HttpException(
        'Match Not exists',
        HttpStatus.BAD_REQUEST,
      );
    }


    const playerAlreadyJoined = await this.matchPLayerModel.findOne({
      matchId: param.matchId,
      userId,
    });
    if (playerAlreadyJoined) {
      throw new HttpException(
        'You have already joined this match',
        HttpStatus.BAD_REQUEST,
      );
    }

    const numberOfMatchId = await this.matchPLayerModel.countDocuments()

    if (numberOfMatchId == 10)
      throw new HttpException("match full of plyers", HttpStatus.BAD_REQUEST)


    const match = await this.matchPLayerModel.create({
      matchId: param.matchId,
      userId,
      isAccepted,
    });



    await this.matchModel.findByIdAndUpdate(param.matchId, {
      $push: { playersOfMatch: match._id }
    })


    await this.userModel.findByIdAndUpdate(userId, {
      $push: { jointedMatch: match._id }
    })

    return await match.populate("userId");
  }

  async findMyMatchPlayer(userId: string) {
    const matchPlayer = await this.matchPLayerModel
      .find({})
      .populate('matchId')
      .populate({ path: 'userId', select: 'email name last_name phone' })
      .exec();

    const myMatchPlayer = matchPlayer.filter(
      (m) => m.matchId.userId.toString() === userId,
    );
    return myMatchPlayer;
  }
  async findAllMatchPlayer() {
    const matchPlayer = await this.matchPLayerModel
      .find({})

      .populate('matchId')
      .populate({ path: 'userId', select: 'email name last_name phone' })
      .exec();

    return matchPlayer;
  }

  async acceptePlayerOfMatch(
    userId: string, playerOfMatchId: string
  ) {


    // get playerMatchId with match => check if user ownId of match the current user =>  => accepte 

    const matchPlayer = await this.matchPLayerModel.findById(playerOfMatchId, "-createdAt -updatedAt").populate({ path: "matchId", select: "userId" })
    console.log(matchPlayer)
    if (matchPlayer == null) {
      throw new HttpException("Request not exists", HttpStatus.BAD_REQUEST)
    }
    if (matchPlayer.matchId.userId.toString() != userId) {
      throw new HttpException("Unauthorized request, your are not the owner of the match", HttpStatus.UNAUTHORIZED)
    }
    if (matchPlayer.isAccepted) {
      throw new HttpException("Request already accpeted", HttpStatus.BAD_REQUEST)
    }

    matchPlayer.isAccepted = true
    return await matchPlayer.save()

  }


  async refusePlayerOfMatch(
    userId: string, playerOfMatchId: string
  ) {

    // get playerMatchId with match => check if user ownId of match the current user =>  => check request not accpeted then delete 

    const matchPlayer = await this.matchPLayerModel.findById(playerOfMatchId, "-createdAt -updatedAt").populate({ path: "matchId", select: "userId" })
    console.log(matchPlayer)
    if (matchPlayer == null) {
      throw new HttpException("Request Not Found", HttpStatus.BAD_REQUEST)
    }

    if (matchPlayer.matchId.userId.toString() != userId) {
      throw new HttpException("Unauthorized request, your are not the owner of the match", HttpStatus.UNAUTHORIZED)
    }
    if (matchPlayer.isAccepted) {
      throw new HttpException("Request already accpeted", HttpStatus.BAD_REQUEST)
    }

    return matchPlayer.deleteOne()

  }




  // findOne(id: number) {
  //   return `This action returns a #${id} matchPlayer`;
  // }

  // update(id: number, updateMatchPlayerDto: UpdateMatchPlayerDto) {
  //   return `This action updates a #${id} matchPlayer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} matchPlayer`;
  // }
}
