import { faker } from "@faker-js/faker";

/** Expected payload schema: 
Video:
	uploadedBy: User
	thumbnailUrl: URL string
	duration: number
	title: string
	viewCount: number
	publishedAt: Date
	description: string
	comments: [Comment]
	createdAt: Date
	updatedAt: Date
	videoHlsUrl: string
	videoProcessedUrl: string
	tags: [string]
Comment: 
	text: string
	commentedBy: User
	likeCount: number
	unlikeCount: number
	isLoved: boolean
	replies: 
		text : string
		commentedBy: User
	createdAt
	updatedAt
User:
	profilePictureUrl
	name
	createdAt
	updatedAt
 */

const getFakeVideosData = () => {
  const videos = [];
  for (let i = 0; i < 10; i++) {
    videos.push({
      id: faker.datatype.uuid(),
      uploadedBy: faker.name.firstName(),
      thumbnailUrl: faker.image.imageUrl,
      duration: faker.random.numeric,
      title: faker.lorem.sentence(5),
    });
  }
};
