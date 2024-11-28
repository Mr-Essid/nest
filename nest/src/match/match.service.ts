import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from './entities/match.entity';
import { Model } from 'mongoose';
import { MatchPlayerService } from 'src/match-player/match-player.service';
import path from 'path';
import { User } from 'src/user/entities/user.entity';
import { Terrain } from 'src/terrain/entities/terrain.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Terrain.name) private terrainModel: Model<Terrain>,
    private readonly matchPlayerService: MatchPlayerService,
  ) { }

  async createMatch(userId: string, createMatchDto: CreateMatchDto) {


    const requestedDatetime = createMatchDto.date;
    const requestedDatetimereserved = new Date(requestedDatetime);
    requestedDatetimereserved.setMinutes(requestedDatetimereserved.getMinutes() + 120); // Add 120 minutes

    console.log('Requested Date:', requestedDatetime);
    console.log('Reserved Match Time:', requestedDatetimereserved);

    const reservedMatch = await this.matchModel.find({
      terrainId: createMatchDto.terrainId,
      date: {
        $gte: requestedDatetime,
        $lte: requestedDatetimereserved,
      },
    }).exec();


    if (reservedMatch.length != 0) {
      throw new HttpException("Sorry, this terrain reserved in this time", HttpStatus.BAD_REQUEST)
    }


    const matchCreated = await this.matchModel.create({
      ...createMatchDto,
      userId,
    });


    // this.matchPlayerService.joinMatch(  we don't neet this shit (we know the owner)
    //   { matchId: matchCreated._id },
    //   userId,
    //   true,
    // );

    await this.userModel.findByIdAndUpdate(userId, { $push: { ownMatchs: matchCreated._id } })

    await this.terrainModel.findByIdAndUpdate(createMatchDto.terrainId, { $push: { matchsIn: matchCreated._id } })
    return matchCreated;
  }

  async findAllMatches() {
    return await this.matchModel
      .find()
      .populate({
        path: 'playersOfMatch', populate: {
          path: "userId",
          select: "name last_name phone id"
        }
      })
      .populate({ path: 'userId', select: 'email name last_name phone' })
      .populate('terrainId')
      .exec();
  }

  async findMyMatches(id: string) {
    return await this.matchModel
      .find({ userId: id })
      .populate({ path: 'userId', select: 'email name last_name phone' })
      .populate('terrainId')
      .exec();
  }


  async findMatchById(id: string) {
    return await this.matchModel.findById(id).
      populate(
        [
          { path: "userId", select: "email name last_name phone" },
          { path: "terrainId", select: "-matchsIn -createdAt -updatedAt -__v" },
          { path: "playersOfMatch", select: "-createdAt -updatedAt -__v", populate: { "path": "userId", select: "name" } },
        ],

      ).exec();
  }

}
