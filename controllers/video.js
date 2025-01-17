import { createError } from "../error.js";
import User from "../models/User.js";
import Video from '../models/Video.js';

export const addVideo = async (req, res, next) => {
    const newVideo = new Video({userId: req.user.id, ...req.body});
    try{
        const saveVideo = await newVideo.save();
        res.status(200).json(saveVideo);
    }catch (err){
        next(err)
    }

}

export const upateVideo = async (req, res, next) => {

    try{
        const video = await Video.findById(req.params.id);
        if(!video) return next(createError(404, "Video not found"));
        if (req.user.id === video.userId){
            const upateVideo = await Video.findByIdAndUpdate(
                req.params.id,
                {
                $set:req.body,
                },
                {
                    new:true
                });
            res.status(200).json(upateVideo)
        }else{
            return next(createError(403, "You can only update your videos."));
        }
        
    }catch (err){
        next(err)
    }
    
}

export const deleteVideo = async (req, res, next) => {

    try{
        const video = await Video.findById(req.params.id);
        if(!video) return next(createError(404, "Video not found"));
        if (req.user.id === video.userId){
            await Video.findByIdAndDelete(
                req.params.id,
                );
            res.status(200).json("The Video has been Deleted.")
        }else{
            return next(createError(403, "You can only delete your videos."));
        }
        
    }catch (err){
        next(err)
    }
    
}

export const getVideo = async (req, res, next) => {
    try{
        const video = await Video.findById(req.params.id)
        res.status(200).json(video)
        
    }catch (err){
        next(err)
    } 
}

export const addView = async (req, res, next) => {
    try{
        const video = await Video.findByIdAndUpdate(req.params.id,{
            $inc:{views:1}
        })
        res.status(200).json("The View has been increased")
        
    }catch (err){
        next(err)
    } 
}

export const randomVideo = async (req, res, next) => {
    try{
        const videos = await Video.aggregate([{$sample: { size: 40}}])
        res.status(200).json(videos)
        
    }catch (err){
        next(err)
    } 
}

export const trendVideo = async (req, res, next) => {
    try{
        const videos = await Video.find().sort({views:-1});
        res.status(200).json(videos)
        
    }catch (err){
        next(err)
    } 
}

export const subscribeVideo = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id)
        const subscrbeChannels = user.subscribedUsers;

        // console.log('Subscribed Channels:', subscrbeChannels);
        const list_Sub = await Promise.all(
            subscrbeChannels.map((channelId) => {
               // console.log('Processing channel ID:', channelId);
              return Video.find({ userId: channelId });
            })
          );
        // console.log('List of Subscriptions:', list_Sub);
        res.status(200).json(list_Sub.flat().sort((a,b)=>b.createdAt - a.createdAt))
        
    }catch (err){
        next(err)
    } 
}

export const getByTag = async (req, res, next) => {
    const tags = req.query.tags.split(",")
    try{
        const videos = await Video.find({tags:{$in:tags}}).limit(20);

        res.status(200).json(videos)
        
    }catch (err){
        next(err)
    } 
}

export const getBySearch = async (req, res, next) => {
    const query = req.query.q
    try{
        const videos = await Video.find({title: {$regex: query,$options: "i"}}).limit(40);
        res.status(200).json(videos)
        
    }catch (err){
        next(err)
    } 
}

