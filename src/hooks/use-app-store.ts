
import { create } from 'zustand';
import { getAuth, onAuthStateChanged, User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser as deleteFirebaseAuthUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch,
  deleteDoc,
  getDocs,
  Timestamp,
  or,
  limit,
  increment,
  runTransaction,
  documentId,
  collectionGroup
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Status } from '@/components/profile/set-status-dialog';
import type { Icon } from 'lucide-react';
import { reactions } from '@/components/shared/post-card';
import { differenceInYears, isSameDay } from 'date-fns';
import { NEXUS_OFICIAL_UID } from '@/lib/constants';
import { moderateText } from '@/ai/flows/text-moderation';


// Embedded author object for denormalization
export type Author = {
  uid: string;
  nickname: string;
  username: string;
  profilePictureUrl: string;
  isVerified: boolean;
}

export type Comment = {
  id: string;
  author: Author;
  text: string;
  createdAt: Date;
  replies?: Comment[];
};

export type PollOption = {
  text: string;
  votes: number;
}

export type Reaction = {
    userId: string;
    type: string; // 'like', 'love', 'haha', etc.
}

export type ReactionType = {
    type: string;
    label: string;
    icon: React.ElementType;
    color: string;
};

export type Post = {
  id: string;
  author: Author;
  authorId: string;
  createdAt: Date;
  content: string; // For text post: the content. For poll: the question.
  content_lowercase?: string; // For case-insensitive search
  textColor?: string;
  type: 'text' | 'poll' | 'video';
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[]; // Array of UIDs
  pollOptions?: PollOption[];
  pollExpiresAt?: Date;
  reactions: Reaction[];
  comments: Comment[];
  shares: number;
  sharedBy: string[];
  editCount?: number;
  visibility?: 'public' | 'followers' | 'private';
};

export type Story = {
    id: string; // Firestore document ID
    authorId: string;
    type: 'text' | 'image' | 'video';
    content: string; // Text content or URL for media
    createdAt: Date;
    viewers: string[]; // Array of UIDs of users who have viewed the story
    viewCount: number;
    likes: number;
    likedBy: string[];
}

export type WallMessage = {
  id: string;
  profileId: string; // UID of the profile the message is on
  author: Author;
  text: string;
  createdAt: Date;
};

export type UserProfile = {
    uid: string;
    nickname:string;
    username: string;
    username_lowercase: string; // For case-insensitive search
    email: string;
    dob: Date;
    orientation: string;
    showOrientation: boolean;
    isPrivate: boolean;
    deactivated: boolean;
    isBlocked?: boolean;
    blockReason?: string;
    isDisabled?: boolean;
    disabledUntil?: Date;
    interests: string[];
    searchableInterests?: string[]; // For case-insensitive search
    profilePictureUrl: string;
    slogan: string;
    location: string;
    createdAt: Date;
    usernameLastChanged?: Date;
    isVerified: boolean;
    currentStatus?: Status | null;
    statusSetAt?: Date | null;
    statusExpiresAt?: Date | null;
    followers: string[];
    following: string[];
    followerCount: number;
    followingCount: number;
    nexusCoins: number;
    lastRewardClaim?: Date;
    hasSeenRewardRules?: boolean;
    hasSeenSecurityUpdate?: boolean;
    securityQuestion?: string;
    securityAnswerHash?: string;
    allowMentions?: boolean;
    showActivityStatus?: boolean;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'chat_request' | 'event' | 'store' | 'hashtag_usage' | 'comment_reply' | 'chat_reinvite';

export type Notification = {
    id: string;
    recipientId: string;
    sender: Author;
    type: NotificationType;
    postId?: string;
    postContentPreview?: string;
    commentText?: string; // For comments or chat requests
    systemMessage?: string; // For system notifications
    itemName?: string; // For store notifications
    itemPrice?: number; // For store notifications
    hashtag?: string; // For hashtag notifications
    chatId?: string; // For chat reinvites
    read: boolean;
    createdAt: Date;
}

export type GlobalAnnouncement = {
    id: string;
    message: string;
    createdAt: Date;
    viewCount?: number;
}

export type GlobalEvent = {
    id: string;
    title: string;
    description: string;
    countdownDate: Date;
    prize: number;
    createdAt: Date;
};

export type AppStatus = {
    isMaintenanceModeEnabled: boolean;
}

export type ModerationLog = {
    id: string;
    action: 'post_blocked' | 'chat_message_warned';
    userId: string;
    userNickname: string;
    content: string;
    reason: string;
    createdAt: Date;
};


export type Chat = {
    id: string;
    members: string[];
    memberInfo: { [key: string]: { nickname: string, profilePictureUrl: string }};
    createdAt: Date;
    lastMessage?: string;
    lastMessageTimestamp?: Date;
    status: 'active' | 'inactive';
    leftBy?: string; // UID of user who left
    unreadCount?: { [userId: string]: number };
}

export type Message = {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: Date;
    status: 'sent' | 'delivered' | 'read';
    isForwarded?: boolean;
    isEdited?: boolean;
    editedAt?: Date;
    deletedFor?: ('all' | string)[]; // Array of user UIDs who have deleted the message
}

export type ZLiveStream = {
  id: string;
  title: string;
  title_lowercase: string;
  author: Author;
  status: 'live' | 'ended';
  createdAt: Date;
  viewerCount: number;
  likes: number;
};

export type GameParticipant = {
  uid: string;
  number: number;
  nickname: string;
  username: string;
  profilePictureUrl: string;
};

type NewPostData = {
  type: 'text';
  content: string;
  textColor?: string;
  mediaFile?: File | null;
} | {
  type: 'poll';
  content: string; // This will be the poll question
  pollOptions: PollOption[];
  pollExpiresAt: Date;
};

type UserWithLastPost = {
  user: UserProfile;
  lastPost: Post | null;
};

export type Hashtag = {
    id: string;
    useCount: number;
    creatorId: string;
    createdAt: Date;
    creatorNickname: string;
};

type SuggestedUsersCriteria = 'new' | 'recent' | 'old' | 'foryou';

export type StoreItem = {
    id: string;
    name: string;
    description: string;
    category: 'profile-frame' | 'text-style';
    price: number;
    creatorId: string;
    creatorNickname: string;
    imageUrl: string;
};

interface AppState {
  // Global app status
  appStatus: AppStatus;
  fetchAppStatus: () => () => void;
  toggleMaintenanceMode: () => Promise<void>;

  // Post state for create-post page (for draft handling)
  postContent: string;
  setPostContent: (content: string) => void;

  posts: Post[];
  isLoadingPosts: boolean;
  addPost: (postData: NewPostData) => Promise<void>;
  toggleReaction: (post: Post, reactionType: string) => Promise<void>;
  addComment: (postId: string, commentText: string, parentCommentId?: string) => Promise<void>;
  addShare: (postId: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<void>;
  searchPosts: (queryText: string) => Promise<Post[]>;
  fetchPostsForUser: (userId: string, onUpdate: (posts: Post[]) => void) => () => void;
  fetchSharedPosts: (userId: string) => Promise<Post[]>;
  
  stories: Story[];
  isLoadingStories: boolean;
  addStory: (story: Omit<Story, 'id' | 'authorId' | 'createdAt' | 'viewers' | 'viewCount' | 'likes' | 'likedBy'>) => Promise<void>;
  fetchStories: (userId: string) => () => void; // Returns unsubscribe
  toggleStoryLike: (story: Story) => Promise<void>;

  wallMessages: WallMessage[];
  addWallMessage: (profileId: string, text: string) => Promise<void>;
  fetchWallMessages: (profileId: string) => () => void;
  
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  isGlobalLoading: boolean;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
  updateUserProfile: (data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'currentStatus' | 'statusExpiresAt' | 'statusSetAt' | 'deactivated'>>) => Promise<void>;
  updateUserStatus: (status: Status | null) => Promise<void>;
  setUser: (user: FirebaseUser | null, profile: UserProfile | null) => void;
  searchUsers: (queryText: string) => Promise<UserProfile[]>;
  getConnections: (userId: string, type: 'followers' | 'following') => Promise<UserProfile[]>;
  claimDailyReward: () => Promise<void>;
  updateSecurityKeywords: (question: string, answer: string) => Promise<void>;
  purchaseItem: (item: StoreItem) => Promise<void>;
  
  suggestedUsers: UserProfile[];
  isLoadingSuggestedUsers: boolean;
  fetchSuggestedUsers: (criteria: SuggestedUsersCriteria) => Promise<void>;
  
  nexStars: UserProfile[];
  isLoadingNexStars: boolean;
  fetchNexStars: () => Promise<void>;

  trendingHashtags: Hashtag[];
  isLoadingHashtags: boolean;
  fetchTrendingHashtags: () => () => void;
  searchHashtags: (queryText: string) => Promise<Hashtag[]>;
  
  allUsers: UserProfile[];
  allUsersWithPosts: UserWithLastPost[];
  isLoadingAllUsers: boolean;
  fetchAllUsersForAdmin: () => Promise<void>;
  fetchAllUsersWithPosts: () => Promise<void>;
  sendRewardReminder: (recipientId: string, message: string) => Promise<void>;
  blockUser: (userId: string, reason: string) => Promise<void>;
  disableUser: (userId: string, disabledUntil: Date) => Promise<void>;
  
  // Account Actions
  loginUser: (email: string, pass: string) => Promise<{success: boolean; message: string}>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  deactivateAccount: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  getSecurityQuestionForUser: (email: string) => Promise<string | null>;
  resetPasswordWithSecurityAnswer: (email: string, answer: string, newPass: string) => Promise<void>;

  
  notifications: Notification[];
  globalAnnouncements: GlobalAnnouncement[];
  isLoadingNotifications: boolean;
  fetchNotifications: () => () => void; // Returns unsubscribe function
  fetchGlobalAnnouncements: () => () => void;
  markNotificationsAsRead: (type: NotificationType) => Promise<void>;
  sendGlobalSystemNotification: (message: string) => Promise<void>;

  globalEvents: GlobalEvent[];
  fetchGlobalEvents: () => () => void;
  sendGlobalEvent: (eventData: Omit<GlobalEvent, 'id' | 'createdAt'>) => Promise<void>;
  
  chats: Chat[];
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  fetchChats: () => () => void;
  fetchMessages: (chatId: string) => () => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  sendChatRequest: (recipientId: string, message: string) => Promise<void>;
  handleChatRequest: (notificationId: string, accepted: boolean) => Promise<string | null>;
  forwardMessage: (targetChatId: string, message: Message) => Promise<void>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string, deleteForEveryone: boolean) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;
  reinviteToChat: (chatId: string, recipientId: string) => Promise<void>;
  respondToChatInvite: (notificationId: string, accepted: boolean) => Promise<void>;
  markChatAsRead: (chatId: string) => Promise<void>;

  toggleFollow: (targetUserId: string) => Promise<void>;
  
  fetchPosts: () => () => void;

  zLiveStreams: ZLiveStream[];
  fetchZLiveStreams: () => () => void;
  startZLive: (title: string) => Promise<string>;
  endZLive: (streamId: string) => Promise<void>;
  fetchZLiveStreamById: (streamId: string) => Promise<ZLiveStream | null>;
  searchZLives: (queryText: string) => Promise<ZLiveStream[]>;

  moderationLogs: ModerationLog[];
  fetchModerationLogs: () => () => void;
  addModerationLog: (log: Omit<ModerationLog, 'id' | 'createdAt'>) => Promise<void>;

}

const extractMentions = (text: string): string[] => {
    const regex = /@(\w+)/g;
    const matches = text.match(regex);
    if (!matches) return [];
    // Return usernames without the '@' symbol
    return matches.map(tag => tag.substring(1));
}

const extractHashtags = (text: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = text.match(regex);
    if (!matches) return [];
    // Return hashtags without the '#' symbol and in lowercase
    return matches.map(tag => tag.substring(1).toLowerCase());
}

const findCommentAndAddReply = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: findCommentAndAddReply(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};


const useAppStoreImpl = create<AppState>((set, get) => ({
  appStatus: { isMaintenanceModeEnabled: false },
  fetchAppStatus: () => {
    if (!db) return () => {};
    const statusRef = doc(db, 'app_status', 'status');
    const unsubscribe = onSnapshot(statusRef, (docSnap) => {
        if (docSnap.exists()) {
            set({ appStatus: docSnap.data() as AppStatus });
        } else {
            set({ appStatus: { isMaintenanceModeEnabled: false }});
        }
    });
    return unsubscribe;
  },
  toggleMaintenanceMode: async () => {
    const { userProfile } = get();
    if (!userProfile || userProfile.email !== 'alexander@gmail.com') {
        throw new Error("Acción no autorizada.");
    }
    const statusRef = doc(db, 'app_status', 'status');
    await setDoc(statusRef, { isMaintenanceModeEnabled: !get().appStatus.isMaintenanceModeEnabled });
  },

  postContent: "",
  setPostContent: (content: string) => set({ postContent: content }),

  posts: [],
  isLoadingPosts: true,
  fetchPosts: () => {
    if (!db) return () => {};

    let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"), 
        limit(50)
    );

    set({ isLoadingPosts: true });
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            pollExpiresAt: data.pollExpiresAt?.toDate(),
          } as Post
      });
      set({ posts, isLoadingPosts: false });
    }, (error) => {
        console.error("Error fetching posts: ", error);
        set({ isLoadingPosts: false });
    });
    
    return unsubscribe;
  },

  fetchPostsForUser: (userId, onUpdate) => {
    if (!db || !userId) return () => {};
    const q = query(collection(db, "posts"), where("authorId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              pollExpiresAt: data.pollExpiresAt?.toDate(),
          } as Post
      });
      const sortedPosts = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onUpdate(sortedPosts);
    }, (error) => {
      console.error("Error fetching user posts:", error);
    });
    
    return unsubscribe;
  },
  
  fetchSharedPosts: async (userId: string) => {
    if (!db || !userId) return [];
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("sharedBy", "array-contains", userId), orderBy("createdAt", "desc"));
    
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        pollExpiresAt: data.pollExpiresAt?.toDate(),
      } as Post;
    });
    return posts;
  },

  addPost: async (postData: NewPostData) => {
    const { user, userProfile } = get();
    if (!user) {
        throw new Error("Usuario no autenticado.");
    }
    if (!userProfile || !userProfile.nickname || !userProfile.username) {
        throw new Error("Tu perfil no está completamente cargado. Inténtalo de nuevo en un momento.");
    }
    
    const isAdmin = userProfile.email === 'alexander@gmail.com';
    if (get().appStatus.isMaintenanceModeEnabled && !isAdmin) {
      throw new Error("La aplicación está en mantenimiento. No se pueden crear publicaciones.");
    }
    
    // AI Moderation
    if (postData.content) {
        const moderationResult = await moderateText({ text: postData.content });
        if (!moderationResult.isSafe) {
          await get().addModerationLog({
              action: 'post_blocked',
              userId: user.uid,
              userNickname: userProfile.nickname,
              content: postData.content,
              reason: moderationResult.reason || 'Contenido no permitido',
          });
          throw new Error(`Tu publicación ha sido bloqueada: ${moderationResult.reason}`);
        }
    }


    const batch = writeBatch(db);
    const postRef = doc(collection(db, "posts"));

    const hashtags = extractHashtags(postData.content);
    const mentionedUsernames = extractMentions(postData.content);
    const mentionedUsernamesLowercase = mentionedUsernames.map(u => u.toLowerCase());

    const basePostData = {
      authorId: user.uid,
      author: {
          uid: user.uid,
          nickname: userProfile.nickname,
          username: userProfile.username,
          profilePictureUrl: userProfile.profilePictureUrl,
          isVerified: userProfile.isVerified,
      },
      content: postData.content,
      content_lowercase: postData.content.toLowerCase(),
      createdAt: serverTimestamp(),
      reactions: [],
      comments: [],
      shares: 0,
      sharedBy: [],
      hashtags: hashtags,
      mentions: [], // Will be filled with UIDs
      editCount: 0,
      visibility: 'public',
    };

    let finalPostData: any = {};
    let imageUrl = "";

    if (postData.type === 'text' && postData.mediaFile) {
        imageUrl = await uploadToCloudinary(postData.mediaFile, "posts");
    }

    if (postData.type === 'text') {
        finalPostData = {
            ...basePostData,
            type: 'text',
            mediaUrls: imageUrl ? [imageUrl] : [],
            textColor: postData.textColor || 'hsl(var(--foreground))',
        };
    } else if (postData.type === 'poll') {
        finalPostData = {
            ...basePostData,
            type: 'poll',
            pollOptions: postData.pollOptions,
            pollExpiresAt: Timestamp.fromDate(postData.pollExpiresAt),
        };
    } else {
        throw new Error("Tipo de publicación no válido");
    }

     // Handle Mentions
    if (mentionedUsernamesLowercase.length > 0) {
      const usersRef = collection(db, 'users');
      // Firestore 'in' query is limited to 10 items.
      const mentionsQuery = query(usersRef, where('username_lowercase', 'in', mentionedUsernamesLowercase.slice(0, 10)));
      
      try {
        const mentionedDocs = await getDocs(mentionsQuery);
        const mentionedUids: string[] = [];
        mentionedDocs.forEach(doc => {
            const mentionedUser = doc.data() as UserProfile;
            // Check if the user allows mentions
            if (mentionedUser.allowMentions === false) return;

            mentionedUids.push(doc.id);
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, {
                recipientId: doc.id,
                sender: basePostData.author,
                type: 'mention',
                postId: postRef.id,
                postContentPreview: postData.content.substring(0, 50),
                read: false,
                createdAt: serverTimestamp(),
            });
        });
        finalPostData.mentions = mentionedUids;
      } catch (error) {
        console.error("Error querying mentioned users:", error);
        // Do not block post creation if mentions fail
      }
    }

    // Handle Hashtags
    for (const tag of hashtags) {
      const hashtagRef = doc(db, "hashtags", tag);
      const hashtagDoc = await getDoc(hashtagRef);

      if (hashtagDoc.exists()) {
        const hashtagData = hashtagDoc.data();
        batch.update(hashtagRef, { useCount: increment(1) });
        // Notify original creator if they are not the current user
        if (hashtagData.creatorId !== user.uid) {
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, {
                recipientId: hashtagData.creatorId,
                sender: basePostData.author,
                type: 'hashtag_usage',
                hashtag: `#${tag}`,
                read: false,
                createdAt: serverTimestamp(),
                systemMessage: `Tu hashtag #${tag} se está volviendo tendencia. Ya lo han usado ${hashtagData.useCount + 1} personas.`
            });
        }
      } else {
        batch.set(hashtagRef, {
            creatorId: user.uid,
            creatorNickname: userProfile.nickname,
            createdAt: serverTimestamp(),
            useCount: 1,
        });
        // Notify user of first creation
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
            recipientId: user.uid,
            sender: basePostData.author, // System notifications still need a sender context
            type: 'hashtag_usage',
            hashtag: `#${tag}`,
            systemMessage: `¡Hola ${userProfile.nickname}! Acabas de crear tu primer hashtag: #${tag}. Te avisaremos aquí cuando y cuántas personas lo han usado.`,
            read: false,
            createdAt: serverTimestamp(),
        });
      }
    }
    
    batch.set(postRef, finalPostData);
    await batch.commit();
  },
  
  toggleReaction: async (post, reactionType) => {
    const { user, userProfile } = get();
    if (!user || !userProfile || !db) return;

    if (user.uid === post.authorId) {
      console.log("User cannot react to their own post.");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    const postReactions = post.reactions || [];
    const myCurrentReaction = postReactions.find(r => r.userId === user.uid);
    let newReactions = [...postReactions];

    const batch = writeBatch(db);

    if (myCurrentReaction) {
      newReactions = newReactions.filter(r => r.userId !== user.uid);
      if (myCurrentReaction.type !== reactionType) {
        newReactions.push({ userId: user.uid, type: reactionType });
      }
    } else {
      newReactions.push({ userId: user.uid, type: reactionType });
      if (!post.reactions.some(r => r.userId === user.uid)) {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
              recipientId: post.authorId,
              sender: {
                  uid: user.uid,
                  nickname: userProfile.nickname,
                  username: userProfile.username,
                  profilePictureUrl: userProfile.profilePictureUrl,
                  isVerified: userProfile.isVerified,
              },
              type: 'like',
              postId: post.id,
              postContentPreview: post.content.substring(0, 50),
              read: false,
              createdAt: serverTimestamp(),
          });
      }
    }
    
    batch.update(postRef, { reactions: newReactions });
    await batch.commit();
  },
  
  addComment: async (postId: string, commentText: string, parentCommentId?: string) => {
    const { user, userProfile } = get();
    if (!user || !userProfile) throw new Error("User not authenticated");
    
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) throw new Error("Post not found");
    const post = postSnap.data() as Post;

    const newComment: Comment = {
      id: doc(collection(db, "posts")).id, // Firestore auto-ID
      author: {
        uid: user.uid,
        nickname: userProfile.nickname,
        username: userProfile.username,
        profilePictureUrl: userProfile.profilePictureUrl,
        isVerified: userProfile.isVerified,
      },
      text: commentText,
      createdAt: new Date(),
      replies: []
    };
    
    const batch = writeBatch(db);
    const newReply = newComment;

    if (parentCommentId) {
      // It's a reply
      const updatedComments = findCommentAndAddReply(post.comments || [], parentCommentId, newReply);
      batch.update(postRef, { comments: updatedComments });
      
      // Notify original comment author
      const findCommentAuthor = (comments: Comment[], id: string): Author | null => {
          for (const c of comments) {
              if (c.id === id) return c.author;
              if (c.replies) {
                  const found = findCommentAuthor(c.replies, id);
                  if (found) return found;
              }
          }
          return null;
      };
      const parentCommentAuthor = findCommentAuthor(post.comments, parentCommentId);
      if (parentCommentAuthor && parentCommentAuthor.uid !== user.uid) {
           const notificationRef = doc(collection(db, 'notifications'));
           batch.set(notificationRef, {
               recipientId: parentCommentAuthor.uid,
               sender: newComment.author,
               type: 'comment_reply',
               postId: postId,
               commentText: commentText,
               postContentPreview: post.content.substring(0, 50),
               read: false,
               createdAt: serverTimestamp(),
           });
      }
    } else {
      // It's a top-level comment
      batch.update(postRef, { comments: arrayUnion(newComment) });
      
      // Notify post author
      if (post.authorId !== user.uid) {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
              recipientId: post.authorId,
              sender: newComment.author,
              type: 'comment',
              postId: postId,
              commentText: commentText,
              postContentPreview: post.content.substring(0, 50),
              read: false,
              createdAt: serverTimestamp(),
          });
      }
    }

    await batch.commit();
  },

  addShare: async (postId: string) => {
    const { user } = get();
    if (!db || !user) return false;
    const postRef = doc(db, "posts", postId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Post does not exist!";
            }
            const postData = postDoc.data();
            const sharedBy = postData.sharedBy || [];
            
            if (sharedBy.includes(user.uid)) {
                // Return a specific value or throw an error to indicate it's already shared
                throw new Error("Ya has compartido este post.");
            }

            transaction.update(postRef, {
                shares: increment(1),
                sharedBy: arrayUnion(user.uid)
            });
        });
        return true;
    } catch (error) {
        console.error("Transaction failed: ", error);
        if (error instanceof Error) {
            throw error;
        }
        return false;
    }
  },

  deletePost: async (postId: string) => {
    const { user } = get();
    if (!user || !db) throw new Error("User not authenticated");
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
  },

  searchPosts: async (queryText: string) => {
      if (!queryText.trim() || !db) return [];
      const lowerCaseQuery = queryText.toLowerCase();
      
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where('content_lowercase', '>=', lowerCaseQuery),
        where('content_lowercase', '<=', lowerCaseQuery + '\uf8ff'),
        orderBy('content_lowercase', 'asc'),
        orderBy('createdAt', 'desc'),
        limit(25)
      );

      try {
        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          posts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            pollExpiresAt: data.pollExpiresAt?.toDate(),
          } as Post);
        });
        return posts;
      } catch (error) {
        console.error('Error searching posts:', error);
        return [];
      }
    },

  stories: [],
  isLoadingStories: true,
  addStory: async (story) => {
    const { user, userProfile } = get();
    if (!user || !userProfile) {
        throw new Error("Usuario no autenticado o Firebase no inicializado.");
    }
    
    if (get().appStatus.isMaintenanceModeEnabled) {
      throw new Error("La aplicación está en mantenimiento. No se pueden crear historias.");
    }
    if (!db) {
        throw new Error("Firebase not initialized");
    }
    
    if (story.type !== 'text') {
        throw new Error("Only text stories are supported at the moment.");
    }
        
    const newStory = {
      ...story,
      authorId: user.uid,
      createdAt: serverTimestamp(),
      viewers: [],
      viewCount: 0,
      likes: 0,
      likedBy: [],
    };
    await addDoc(collection(db, "stories"), newStory);
  },
   fetchStories: (userId) => {
    if (!db || !userId) return () => {};

    set({ isLoadingStories: true });
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, 'stories'),
      where('authorId', '==', userId),
      where('createdAt', '>=', twentyFourHoursAgo)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as Story;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort client-side
      set({ stories: storiesData, isLoadingStories: false });
    }, (error) => {
      console.error("Error fetching stories:", error);
      set({ isLoadingStories: false });
    });

    return unsubscribe;
  },
  toggleStoryLike: async (story) => {
    const { user } = get();
    if (!user || !db) return;
    if (user.uid === story.authorId) {
        console.log("User cannot like their own story.");
        return;
    }
    
    const storyRef = doc(db, "stories", story.id);
    const isLiked = story.likedBy?.includes(user.uid);
    
    await updateDoc(storyRef, {
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: increment(isLiked ? -1 : 1),
    });
  },

  wallMessages: [],
  fetchWallMessages: (profileId: string) => {
    if (!db || !profileId) return () => {};
    const q = query(collection(db, 'wallMessages'), where('profileId', '==', profileId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as WallMessage;
      });
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      set({ wallMessages: messages });
    }, (error) => {
      console.error("Error fetching wall messages:", error);
    });

    return unsubscribe;
  },
  addWallMessage: async (profileId: string, text: string) => {
    const { user, userProfile } = get();
    if (!user || !userProfile) {
        throw new Error("Usuario no autenticado o Firebase no inicializado.");
    }
    if (get().appStatus.isMaintenanceModeEnabled) {
      throw new Error("La aplicación está en mantenimiento.");
    }
    if (!db) throw new Error("DB not initialized");
    
    const messageData = {
      profileId,
      text,
      author: {
        uid: user.uid,
        nickname: userProfile.nickname,
        username: userProfile.username,
        profilePictureUrl: userProfile.profilePictureUrl,
        isVerified: userProfile.isVerified,
      },
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'wallMessages'), messageData);
  },
  
  user: null,
  userProfile: null,
  isLoadingProfile: true,
  isGlobalLoading: true,
  setUser: (user, profile) => set({ user, userProfile: profile, isGlobalLoading: false }),
  fetchUserProfile: async (uid: string) => {
    if (!uid) {
        set({ isLoadingProfile: false });
        if (get().user?.uid === uid) {
            set({ userProfile: null });
        }
        return null;
    };
    set({ isLoadingProfile: true });
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) {
            console.error("Error fetching user profile from Supabase:", error);
            if (get().user?.uid === uid) {
              set({ userProfile: null });
            }
            set({ isLoadingProfile: false });
            return null;
        }

        if (data) {
            const profileData = {
                uid: data.id,
                ...data,
                dob: data.birth_date ? new Date(data.birth_date) : new Date(),
                createdAt: data.created_at ? new Date(data.created_at) : new Date(),
                nickname: data.nickname || data.username,
                profilePictureUrl: data.profile_pic || 'https://picsum.photos/200',
                isVerified: data.is_verified || false,
                nexusCoins: data.points || 0,
            } as any;

            if (get().user?.uid === uid) {
              set({ userProfile: profileData });
            }
            set({isLoadingProfile: false });
            return profileData;
        }
        return null;
    } catch(error) {
        console.error("Error fetching user profile:", error);
        set({ userProfile: null, isLoadingProfile: false });
        return null;
    }
  },
  updateUserProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error("User not authenticated");
    
    const updateData: { [key: string]: any } = {};
    if (data.username) updateData.username = data.username;
    if (data.nickname) updateData.nickname = data.nickname;
    if (data.bio) updateData.bio = data.bio;
    if (data.profilePictureUrl) updateData.profile_pic = data.profilePictureUrl;
    if (data.hobbies) updateData.hobbies = data.hobbies;
    if (data.points !== undefined) updateData.points = data.points;

    try {
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.uid);

      if (error) throw error;
      await get().fetchUserProfile(user.uid);
    } catch (error) {
      console.error("Error updating profile in Supabase:", error);
    }
  },
  updateUserStatus: async (status: Status | null) => {
    const { user } = get();
    if (!user) throw new Error("User not authenticated");

    try {
      const statusData = status ? {
        vibe_key: status.vibeKey || null,
        status_text: status.text || "",
        status_set_at: new Date().toISOString()
      } : {
        vibe_key: null,
        status_text: null,
        status_set_at: null
      };

      const { error } = await supabase
        .from('users')
        .update(statusData)
        .eq('id', user.uid);

      if (error) throw error;
      await get().fetchUserProfile(user.uid);
    } catch (error) {
      console.error("Error updating status in Supabase:", error);
    }
  },
  searchUsers: async (queryText: string) => {
      if (!queryText.trim()) return [];
      const lowerCaseQuery = queryText.toLowerCase();
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('username', `%${lowerCaseQuery}%`)
          .limit(10);

        if (error) throw error;

        return (data || []).map(u => ({
          ...u,
          uid: u.id,
          dob: u.birth_date ? new Date(u.birth_date) : new Date(),
          profilePictureUrl: u.profile_pic || 'https://picsum.photos/200'
        } as unknown as UserProfile));
      } catch (error) {
        console.error("Error searching users in Supabase:", error);
        return [];
      }
  },
    
  getConnections: async (userId, type) => {
    if (!userId || !db) return [];
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userIds = userDoc.data()?.[type] || [];
    if (userIds.length === 0) return [];

    const users: UserProfile[] = [];
    // Firestore 'in' query supports up to 30 elements in the array
    for (let i = 0; i < userIds.length; i += 30) {
        const chunk = userIds.slice(i, i + 30);
        if (chunk.length === 0) continue;
        const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    ...data,
                    uid: doc.id,
                    dob: data.dob?.toDate(),
                    createdAt: data.createdAt?.toDate(),
                } as UserProfile);
            });
        } catch(e) {
            console.error("Failed to fetch connections chunk", e)
        }
    }
    return users;
  },

  claimDailyReward: async () => {
        const { user, userProfile } = get();
        if (!user || !userProfile || !db) throw new Error("User not authenticated.");

        const today = new Date();
        if (userProfile.lastRewardClaim && isSameDay(userProfile.lastRewardClaim, today)) {
            throw new Error("Ya has reclamado tu recompensa de hoy.");
        }

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            nexusCoins: increment(8),
            lastRewardClaim: serverTimestamp(),
            hasSeenRewardRules: true,
        });
    },
  
  updateSecurityKeywords: async (question, answer) => {
    const { user } = get();
    if (!user || !db) throw new Error("User not authenticated.");

    const userRef = doc(db, "users", user.uid);
    // In a real app, you would hash the answer on the server side.
    // For this prototype, we'll store it directly, but name the field `securityAnswerHash`
    // to indicate the intent.
    await updateDoc(userRef, {
        securityQuestion: question,
        securityAnswerHash: answer,
    });
    // Re-fetch user profile to update state
    await get().fetchUserProfile(user.uid);
  },
  
  purchaseItem: async (item: StoreItem) => {
    const { user, userProfile } = get();
    if (!user || !userProfile || !db) throw new Error("User not authenticated");
    if (userProfile.nexusCoins < item.price) {
        throw new Error("Fondos insuficientes.");
    }

    const buyerRef = doc(db, "users", user.uid);
    // Assuming a single creator for now. In a real app, you might have a 'creators' collection.
    const creatorRef = doc(db, "users", NEXUS_OFICIAL_UID);
    const notificationRef = doc(collection(db, 'notifications'));

    const batch = writeBatch(db);

    // 1. Deduct coins from buyer
    batch.update(buyerRef, { nexusCoins: increment(-item.price) });
    // 2. Add coins to creator (handle if creator is not NEXUS OFICIAL later)
    if (item.creatorId === NEXUS_OFICIAL_UID) {
        batch.update(creatorRef, { nexusCoins: increment(item.price) });
    }
    // 3. Add item to buyer's inventory (not implemented yet, placeholder)
    // batch.update(buyerRef, { inventory: arrayUnion(item.id) });

    // 4. Send notification to creator
    batch.set(notificationRef, {
        recipientId: item.creatorId,
        sender: {
            uid: user.uid,
            nickname: userProfile.nickname,
            username: userProfile.username,
            profilePictureUrl: userProfile.profilePictureUrl,
            isVerified: userProfile.isVerified,
        },
        type: 'store',
        itemName: item.name,
        itemPrice: item.price,
        read: false,
        createdAt: serverTimestamp(),
    });

    await batch.commit();
  },

  suggestedUsers: [],
  isLoadingSuggestedUsers: true,
  fetchSuggestedUsers: async (criteria: SuggestedUsersCriteria) => {
    const { user, userProfile } = get();
    if (!user || !userProfile || !db) return;

    set({ isLoadingSuggestedUsers: true });
    try {
        let q;
        const usersRef = collection(db, "users");

        switch (criteria) {
            case 'new':
                q = query(usersRef, orderBy("createdAt", "desc"), limit(6));
                break;
            case 'old':
                q = query(usersRef, orderBy("createdAt", "asc"), limit(6));
                break;
            case 'foryou':
                if (userProfile.interests.length > 0) {
                    q = query(usersRef, where('interests', 'array-contains-any', userProfile.interests.slice(0, 10)), limit(20));
                } else {
                    q = query(usersRef, orderBy("createdAt", "desc"), limit(6));
                }
                break;
            case 'recent':
            default:
                // Placeholder logic for recent, as last seen is not tracked yet
                q = query(usersRef, orderBy("createdAt", "desc"), limit(6));
                break;
        }

        const querySnapshot = await getDocs(q);
        let users: UserProfile[] = [];
        querySnapshot.forEach(doc => {
            if (doc.id !== user.uid) { // Exclude self
                const data = doc.data();
                users.push({
                    uid: doc.id,
                    ...data,
                    dob: data.dob?.toDate(),
                    createdAt: data.createdAt?.toDate(),
                } as UserProfile);
            }
        });
        
        if (criteria === 'foryou') {
          // Sort by number of common interests
          users.sort((a, b) => {
            const aCommon = a.interests.filter(i => userProfile.interests.includes(i)).length;
            const bCommon = b.interests.filter(i => userProfile.interests.includes(i)).length;
            return bCommon - aCommon;
          });
          users = users.slice(0, 6);
        }

        set({ suggestedUsers: users, isLoadingSuggestedUsers: false });

    } catch (error) {
        console.error("Error fetching suggested users:", error);
        set({ isLoadingSuggestedUsers: false });
    }
  },
    
  nexStars: [],
  isLoadingNexStars: true,
  fetchNexStars: async () => {
    if (!db) return;
    set({ isLoadingNexStars: true });
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy("followerCount", "desc"), limit(3));
        
        const querySnapshot = await getDocs(q);
        const topUsers: UserProfile[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            topUsers.push({
                uid: doc.id,
                ...data,
                dob: data.dob?.toDate(),
                createdAt: data.createdAt?.toDate(),
            } as UserProfile);
        });
        
        set({ nexStars: topUsers, isLoadingNexStars: false });
    } catch (error) {
        console.error("Error fetching NexStars:", error);
        set({ isLoadingNexStars: false });
    }
  },

    trendingHashtags: [],
    isLoadingHashtags: true,
    fetchTrendingHashtags: () => {
        if (!db) return () => {};

        set({ isLoadingHashtags: true });
        const q = query(
            collection(db, "hashtags"),
            orderBy("useCount", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const hashtags = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    useCount: data.useCount,
                    creatorId: data.creatorId,
                    creatorNickname: data.creatorNickname,
                    createdAt: data.createdAt.toDate(),
                } as Hashtag;
            });
            
            set({ trendingHashtags: hashtags, isLoadingHashtags: false });
        }, (error) => {
            console.error("Error fetching hashtags:", error);
            set({ isLoadingHashtags: false });
        });

        return unsubscribe;
    },
    
    searchHashtags: async (queryText: string) => {
        if (!queryText.trim() || !db) return [];
        const lowerCaseQuery = queryText.toLowerCase();

        const hashtagsRef = collection(db, "hashtags");
        const q = query(
            hashtagsRef,
            where(documentId(), '>=', lowerCaseQuery),
            where(documentId(), '<=', lowerCaseQuery + '\uf8ff'),
            limit(10)
        );
        
        try {
            const querySnapshot = await getDocs(q);
            const hashtags: Hashtag[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                hashtags.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                } as Hashtag);
            });
            return hashtags;
        } catch (error) {
            console.error('Error searching hashtags:', error);
            return [];
        }
    },

    allUsers: [],
    allUsersWithPosts: [],
    isLoadingAllUsers: true,
    fetchAllUsersForAdmin: async () => {
        const { userProfile } = get();
        if (!userProfile || userProfile.email !== 'alexander@gmail.com' || !db) return;
        
        set({ isLoadingAllUsers: true });
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "!=", userProfile.uid));
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
                lastRewardClaim: doc.data().lastRewardClaim?.toDate(),
                disabledUntil: doc.data().disabledUntil?.toDate(),
            } as UserProfile));
            set({ allUsers: users.sort((a, b) => a.nickname.localeCompare(b.nickname)), isLoadingAllUsers: false });
        } catch (error) {
            console.error("Error fetching all users for admin:", error);
            set({ isLoadingAllUsers: false });
        }
    },
     fetchAllUsersWithPosts: async () => {
        const { userProfile } = get();
        if (!userProfile || userProfile.email !== 'alexander@gmail.com' || !db) return;
        
        set({ isLoadingAllUsers: true });
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "!=", userProfile.uid));
            const usersSnapshot = await getDocs(q);
            
            const usersWithPosts = await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
                const userData = userDoc.data() as UserProfile;
                return {
                    user: { ...userData, uid: userDoc.id },
                    lastPost: null // Placeholder
                };
            }));
            
            set({ allUsersWithPosts: usersWithPosts, isLoadingAllUsers: false });
        } catch (error) {
            console.error("Error fetching users with posts:", error);
            set({ isLoadingAllUsers: false });
        }
    },
    sendRewardReminder: async (recipientId: string, message: string) => {
        const { userProfile } = get();
        if (!userProfile || !db) return;

        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
            recipientId,
            sender: {
                uid: userProfile.uid,
                nickname: userProfile.nickname,
                username: userProfile.username,
                profilePictureUrl: userProfile.profilePictureUrl,
                isVerified: userProfile.isVerified,
            },
            type: 'system',
            systemMessage: message,
            read: false,
            createdAt: serverTimestamp(),
        });
    },
    blockUser: async (userId: string, reason: string) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isBlocked: true,
            blockReason: reason,
        });
        get().fetchAllUsersForAdmin(); // Refresh the list
    },
    disableUser: async (userId: string, disabledUntil: Date) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isDisabled: true,
            disabledUntil: Timestamp.fromDate(disabledUntil),
        });
        get().fetchAllUsersForAdmin(); // Refresh the list
    },
    
    notifications: [],
    globalAnnouncements: [],
    isLoadingNotifications: true,
    fetchNotifications: () => {
        const user = get().user;
        if (!user || !db) return () => {};

        set({ isLoadingNotifications: true });
        const q = query(collection(db, 'notifications'), where('recipientId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                } as Notification;
            }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
            set({ notifications: notificationsData, isLoadingNotifications: false });
        }, (error) => {
            console.error("Error fetching notifications:", error);
            set({ isLoadingNotifications: false });
        });

        return unsubscribe;
    },
    fetchGlobalAnnouncements: () => {
        if (!db) return () => {};
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const announcements = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                } as GlobalAnnouncement;
            });
            set({ globalAnnouncements: announcements });
        });
        return unsubscribe;
    },
    
    markNotificationsAsRead: async (type: NotificationType) => {
        const { user, notifications } = get();
        if (!user || !db) return;
        
        const unreadOfType = notifications.filter(n => n.type === type && !n.read);
        if (unreadOfType.length === 0) return;

        const batch = writeBatch(db);
        unreadOfType.forEach(n => {
            const notifRef = doc(db, 'notifications', n.id);
            batch.update(notifRef, { read: true });
        });
        await batch.commit();
    },
    
    sendGlobalSystemNotification: async (message: string) => {
        const { userProfile } = get();

        if (!userProfile || userProfile.email !== 'alexander@gmail.com') {
            throw new Error("Acción no autorizada.");
        }
        if (!db) throw new Error("DB not initialized");
    
        await addDoc(collection(db, "announcements"), {
            message: message,
            createdAt: serverTimestamp(),
            viewCount: 0
        });
    },

    globalEvents: [],
    fetchGlobalEvents: () => {
        if (!db) return () => {};
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    countdownDate: data.countdownDate?.toDate(),
                } as GlobalEvent;
            });
            set({ globalEvents: events });
        });
        return unsubscribe;
    },
    sendGlobalEvent: async (eventData) => {
        const { userProfile } = get();

        if (!userProfile || userProfile.email !== 'alexander@gmail.com') {
            throw new Error("Acción no autorizada.");
        }
        if (!db) throw new Error("DB not initialized");
        
        const event = {
            ...eventData,
            createdAt: serverTimestamp(),
        }

        await addDoc(collection(db, "events"), event);
    },
    
    chats: [],
    messages: [],
    isLoadingChats: true,
    isLoadingMessages: true,
    fetchChats: () => {
        const { user } = get();
        if (!user || !db) {
            set({ isLoadingChats: false });
            return () => {};
        }
        
        set({ isLoadingChats: true });
        const q = query(collection(db, 'chats'), where('members', 'array-contains', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    lastMessageTimestamp: data.lastMessageTimestamp?.toDate()
                } as Chat;
            });
            // Sort client-side to prevent index error
            chats.sort((a,b) => (b.lastMessageTimestamp?.getTime() || 0) - (a.lastMessageTimestamp?.getTime() || 0));
            set({ chats, isLoadingChats: false });
        }, (error) => {
            console.error("Error fetching chats:", error);
            set({ isLoadingChats: false });
        });

        return unsubscribe;
    },
    fetchMessages: (chatId: string) => {
        const { user } = get();
        if (!db || !user) return () => {};
        set({ isLoadingMessages: true });
            
        const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    editedAt: data.editedAt?.toDate(),
                } as Message;
            });
            set({ messages, isLoadingMessages: false });
        }, (error) => {
            console.error("Error fetching messages:", error);
            set({ isLoadingMessages: false });
        });
        return unsubscribe;
    },
    sendMessage: async (chatId, text) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) {
            throw new Error("Usuario no autenticado o Firebase no inicializado.");
        }
        
         if (get().appStatus.isMaintenanceModeEnabled && userProfile.email !== 'alexander@gmail.com') {
            throw new Error("La aplicación está en mantenimiento.");
        }
        if (!db) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const chatRef = doc(db, 'chats', chatId);

        const batch = writeBatch(db);

        batch.set(doc(messagesRef), {
            chatId,
            senderId: user.uid,
            text,
            createdAt: serverTimestamp(),
            status: 'sent', // Initial status
        });
        
        const chatDoc = await getDoc(chatRef);
        const chatData = chatDoc.data() as Chat;
        const otherMemberId = chatData.members.find(p => p !== user.uid);

        batch.update(chatRef, {
            lastMessage: text,
            lastMessageTimestamp: serverTimestamp(),
            [`unreadCount.${otherMemberId}`]: increment(1),
        });

        await batch.commit();
    },
    markChatAsRead: async (chatId: string) => {
        const { user } = get();
        if (!user || !db || !chatId) return;

        const chatRef = doc(db, 'chats', chatId);
        const updateData: { [key: string]: any } = {};
        updateData[`unreadCount.${user.uid}`] = 0;
        await updateDoc(chatRef, updateData);
    },

    sendChatRequest: async (recipientId: string, message: string) => {
        const { user, userProfile } = get();
        if (!user || !userProfile || !db) throw new Error("User not authenticated");

        // Check if a chat already exists
        const chatId = [user.uid, recipientId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
            throw new Error("Ya existe un chat con este usuario.");
        }

        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, 
            where('type', '==', 'chat_request'),
            where('sender.uid', '==', user.uid),
            where('recipientId', '==', recipientId)
        );
        const existingRequest = await getDocs(q);
        if (!existingRequest.empty) {
            throw new Error("Ya has enviado una solicitud de chat a este usuario.");
        }
        
        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
            recipientId,
            sender: {
                uid: user.uid,
                nickname: userProfile.nickname,
                username: userProfile.username,
                profilePictureUrl: userProfile.profilePictureUrl,
                isVerified: userProfile.isVerified,
            },
            type: 'chat_request',
            commentText: message,
            read: false,
            createdAt: serverTimestamp(),
        });
    },
    
    handleChatRequest: async (notificationId: string, accepted: boolean) => {
        const { user, userProfile, notifications } = get();
        if (!user || !userProfile || !db) throw new Error("User not authenticated");
        
        const notificationRef = doc(db, 'notifications', notificationId);
        
        if (!accepted) {
            await deleteDoc(notificationRef);
            return null;
        }

        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) throw new Error("Notification not found");

        const sender = notification.sender;
        const chatDocId = [user.uid, sender.uid].sort().join('_');
        const chatRef = doc(db, 'chats', chatDocId);
        const batch = writeBatch(db);

        batch.set(chatRef, {
            members: [user.uid, sender.uid],
            memberInfo: {
                [user.uid]: {
                    nickname: userProfile.nickname,
                    profilePictureUrl: userProfile.profilePictureUrl
                },
                [sender.uid]: {
                    nickname: sender.nickname,
                    profilePictureUrl: sender.profilePictureUrl
                }
            },
            createdAt: serverTimestamp(),
            lastMessage: "¡Has aceptado la solicitud de chat!",
            lastMessageTimestamp: serverTimestamp(),
            status: 'active',
            unreadCount: { [user.uid]: 0, [sender.uid]: 1 },
        }, { merge: true });

        batch.delete(notificationRef);
        
        const currentUserRef = doc(db, "users", user.uid);
        const senderUserRef = doc(db, "users", sender.uid);
        batch.update(currentUserRef, { following: arrayUnion(sender.uid), followingCount: increment(1) });
        batch.update(senderUserRef, { followers: arrayUnion(user.uid), followerCount: increment(1) });


        await batch.commit();
        return chatDocId;
    },

    forwardMessage: async (targetChatId: string, message: Message) => {
        const { user } = get();
        if (!user || !db) return;

        const messagesRef = collection(db, 'chats', targetChatId, 'messages');
        const chatRef = doc(db, 'chats', targetChatId);

        const batch = writeBatch(db);

        const forwardedMessage = {
            ...message,
            id: doc(messagesRef).id, // generate new ID
            chatId: targetChatId,
            senderId: user.uid, // sender is the current user
            createdAt: serverTimestamp(),
            status: 'sent',
            isForwarded: true,
        };
        delete (forwardedMessage as any).editedAt;
        delete (forwardedMessage as any).deletedFor;

        batch.set(doc(messagesRef), forwardedMessage);
        
        batch.update(chatRef, {
            lastMessage: `Reenviado: ${message.text}`,
            lastMessageTimestamp: serverTimestamp()
        });

        await batch.commit();
    },
    editMessage: async (chatId, messageId, newText) => {
        if (!db) return;
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        await updateDoc(messageRef, {
            text: newText,
            isEdited: true,
            editedAt: serverTimestamp(),
        });
    },
    deleteMessage: async (chatId, messageId, deleteForEveryone) => {
        const { user } = get();
        if (!user || !db) return;
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

        if (deleteForEveryone) {
             await updateDoc(messageRef, {
                text: "Este mensaje fue eliminado.",
                deletedFor: ['all']
            });
        } else {
             await updateDoc(messageRef, {
                deletedFor: arrayUnion(user.uid)
            });
        }
    },

    leaveChat: async (chatId: string) => {
        const { user } = get();
        if (!user || !db) throw new Error("User not authenticated.");
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            status: 'inactive',
            leftBy: user.uid,
            lastMessage: "Un usuario ha salido del chat.",
            lastMessageTimestamp: serverTimestamp(),
        });
    },
    reinviteToChat: async (chatId: string, recipientId: string) => {
        const { user, userProfile } = get();
        if (!user || !userProfile || !db) throw new Error("User not authenticated.");

        const notification = {
            recipientId,
            sender: {
                uid: user.uid,
                nickname: userProfile.nickname,
                username: userProfile.username,
                profilePictureUrl: userProfile.profilePictureUrl,
                isVerified: userProfile.isVerified,
            },
            type: 'chat_reinvite' as NotificationType,
            chatId: chatId,
            read: false,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'notifications'), notification);
    },
    respondToChatInvite: async (notificationId: string, accepted: boolean) => {
        const { notifications } = get();
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification || !notification.chatId) throw new Error("Invalid notification.");
        
        const batch = writeBatch(db);
        const notificationRef = doc(db, 'notifications', notificationId);
        const chatRef = doc(db, 'chats', notification.chatId);

        if (accepted) {
            batch.update(chatRef, {
                status: 'active',
                lastMessage: `${notification.sender.nickname} ha vuelto al chat.`,
                lastMessageTimestamp: serverTimestamp(),
            });
        }
        // If rejected, we just delete the notification, nothing else happens for now.

        batch.delete(notificationRef);
        await batch.commit();
    },

    toggleFollow: async (targetUserId: string) => {
        const { user, userProfile } = get();
        if (!user || !userProfile || !db || user.uid === targetUserId) return;

        const currentUserRef = doc(db, "users", user.uid);
        const targetUserRef = doc(db, "users", targetUserId);

        const isFollowing = userProfile.following?.includes(targetUserId);

        const batch = writeBatch(db);

        if (isFollowing) {
            batch.update(currentUserRef, { 
                following: arrayRemove(targetUserId),
                followingCount: increment(-1)
            });
            batch.update(targetUserRef, {
                followers: arrayRemove(user.uid),
                followerCount: increment(-1)
            });
        } else {
            batch.update(currentUserRef, {
                following: arrayUnion(targetUserId),
                followingCount: increment(1)
            });
            batch.update(targetUserRef, {
                followers: arrayUnion(user.uid),
                followerCount: increment(1)
            });
            
            const notificationRef = doc(collection(db, 'notifications'));
             batch.set(notificationRef, {
                recipientId: targetUserId,
                sender: {
                    uid: user.uid,
                    nickname: userProfile.nickname,
                    username: userProfile.username,
                    profilePictureUrl: userProfile.profilePictureUrl,
                    isVerified: userProfile.isVerified,
                },
                type: 'follow',
                read: false,
                createdAt: serverTimestamp(),
            });
        }
        
        await batch.commit();
        get().fetchUserProfile(user.uid);
    },

    // --- Account Actions ---
    loginUser: async (email, pass) => {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        return { success: true, message: "Inicio de sesión exitoso." };
      } catch (error: any) {
        console.error("Firebase login error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          return { success: false, message: "Las credenciales son incorrectas. Revisa tu email y contraseña." };
        }
        return { success: false, message: "Ocurrió un error. Por favor, inténtalo de nuevo." };
      }
    },
    changePassword: async (currentPass: string, newPass: string) => {
        const { user } = get();
        if (!user || !user.email) throw new Error("Usuario no autenticado.");
        
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        
        try {
            await reauthenticateWithCredential(user, credential);
        } catch (error) {
            console.error("Reauthentication failed:", error);
            throw new Error("La contraseña actual es incorrecta.");
        }
        
        try {
            await updatePassword(user, newPass);
        } catch (error) {
            console.error("Password update failed:", error);
            throw new Error("No se pudo actualizar la contraseña.");
        }
    },

    deactivateAccount: async () => {
        const { user } = get();
        if (!user || !db) throw new Error("Usuario no autenticado.");
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { deactivated: true });
        await auth.signOut();
    },

    deleteAccount: async (password: string) => {
        const { user } = get();
        if (!user || !user.email || !db) throw new Error("Usuario no autenticado.");

        const credential = EmailAuthProvider.credential(user.email, password);
        try {
            await reauthenticateWithCredential(user, credential);
        } catch (error) {
            throw new Error("La contraseña es incorrecta. No se puede eliminar la cuenta.");
        }
        
        const userRef = doc(db, "users", user.uid);
        await deleteDoc(userRef);

        await deleteFirebaseAuthUser(user);
    },
    getSecurityQuestionForUser: async (email: string) => {
        if (!db) return null;
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("No se encontró ningún usuario con ese correo electrónico.");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;

        if (!userData.securityQuestion) {
            throw new Error("Este usuario no ha configurado una pregunta de seguridad.");
        }

        return userData.securityQuestion;
    },
    resetPasswordWithSecurityAnswer: async (email, answer, newPassword) => {
        if (!db) throw new Error("Database not initialized.");

        // Find user by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Error interno: no se pudo encontrar el usuario.");
        }
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;

        // Verify answer (plain text comparison for this prototype)
        if (userData.securityAnswerHash !== answer) {
            throw new Error("La respuesta secreta es incorrecta.");
        }
        
        // This is a workaround since we can't directly set a new password without auth.
        // In a real app, this would be a Cloud Function that uses the Admin SDK.
        // We'll simulate success by updating a field.
        console.log(`Password for ${email} would be reset to ${newPassword}`);
        const userRef = doc(db, "users", userDoc.id);
        // In a real scenario, you wouldn't do this. This is a placeholder for successful recovery.
        await updateDoc(userRef, { slogan: `Contraseña recuperada el ${new Date().toLocaleDateString()}` });
    },

  // ZLive
  zLiveStreams: [],
  fetchZLiveStreams: () => {
    if (!db) return () => {};
    // Modified query to remove status filter to avoid index error.
    const q = query(collection(db, 'z-lives'), orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const streams = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as ZLiveStream;
        })
        .filter(stream => stream.status === 'live'); // Filter client-side
      set({ zLiveStreams: streams });
    }, (error) => {
        console.error("Error fetching ZLive streams:", error);
    });
    
    return unsubscribe;
  },
  startZLive: async (title: string): Promise<string> => {
    const { user, userProfile } = get();
    if (!user || !userProfile) {
      throw new Error("Usuario no autenticado o Firebase no inicializado.");
    }

    const liveStreamRef = doc(collection(db, 'z-lives'));
    const liveStreamData: Omit<ZLiveStream, 'id'> = {
      title,
      title_lowercase: title.toLowerCase(),
      author: {
        uid: user.uid,
        nickname: userProfile.nickname,
        username: userProfile.username,
        profilePictureUrl: userProfile.profilePictureUrl,
        isVerified: userProfile.isVerified,
      },
      status: 'live',
      createdAt: new Date(),
      viewerCount: 0,
      likes: 0,
    };
    
    await setDoc(liveStreamRef, {
      ...liveStreamData,
      createdAt: serverTimestamp() // Use server timestamp for creation
    });

    return liveStreamRef.id;
  },
  endZLive: async (streamId: string) => {
    if (!db) return;
    const liveStreamRef = doc(db, 'z-lives', streamId);
    await updateDoc(liveStreamRef, {
      status: 'ended',
    });
  },
  fetchZLiveStreamById: async (streamId) => {
    if (!db) return null;
    const streamRef = doc(db, 'z-lives', streamId);
    const docSnap = await getDoc(streamRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as ZLiveStream;
    }
    return null;
  },
  searchZLives: async (queryText: string) => {
    if (!queryText.trim() || !db) return [];
    const lowerCaseQuery = queryText.toLowerCase();

    const zlivesRef = collection(db, "z-lives");
    const q = query(
        zlivesRef,
        where('status', '==', 'live'),
        where('title_lowercase', '>=', lowerCaseQuery),
        where('title_lowercase', '<=', lowerCaseQuery + '\uf8ff'),
        limit(10)
    );

    try {
        const querySnapshot = await getDocs(q);
        const zlives: ZLiveStream[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            zlives.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            } as ZLiveStream);
        });
        return zlives;
    } catch (error) {
        console.error('Error searching ZLives:', error);
        return [];
    }
  },

  moderationLogs: [],
  fetchModerationLogs: () => {
    if (!db) return () => {};
    const q = query(collection(db, 'moderation_logs'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as ModerationLog));
      set({ moderationLogs: logs });
    });
    return unsubscribe;
  },

  addModerationLog: async (logData) => {
    if (!db) return;
    await addDoc(collection(db, 'moderation_logs'), {
      ...logData,
      createdAt: serverTimestamp(),
    });
  },

}));


let unsubscribeFromAuth: (() => void) | null = null;
let unsubscribeFromStatus: (() => void) | null = null;

/**
 * Creates a default user profile in Firestore for an authenticated user who doesn't have one.
 * This is a recovery mechanism for users created with a broken registration flow.
 */
const createDefaultProfileIfNotExists = async (user: FirebaseUser): Promise<UserProfile | null> => {
    if (!db) return null;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        // Profile already exists, do nothing.
        return null;
    }

    // Profile doesn't exist, create a default one.
    console.log(`Creating default profile for existing user: ${user.uid}`);
    const username = user.email ? user.email.split('@')[0] : `user${user.uid.substring(0, 5)}`;
    
    const defaultProfile: Omit<UserProfile, 'uid'> = {
        email: user.email || "",
        nickname: username,
        username: username,
        username_lowercase: username.toLowerCase(),
        dob: new Date(2000, 0, 1), // Default DOB
        orientation: 'Prefiero no decirlo',
        showOrientation: false,
        interests: [],
        profilePictureUrl: '',
        slogan: 'Un alma libre explorando el cosmos digital.',
        location: 'Vía Láctea',
        createdAt: new Date(),
        isVerified: false,
        followers: [],
        following: [],
        followerCount: 0,
        followingCount: 0,
        nexusCoins: 0,
        isPrivate: false,
        deactivated: false,
        allowMentions: true,
        showActivityStatus: true,
    };

    await setDoc(userRef, { ...defaultProfile, createdAt: serverTimestamp(), usernameLastChanged: serverTimestamp() });
    
    // Fetch the newly created profile to return it
    const newDocSnap = await getDoc(userRef);
    const data = newDocSnap.data();
    if (!data) return null;
    
    return {
        uid: user.uid,
        ...data,
        dob: data.dob?.toDate(),
        createdAt: data.createdAt?.toDate(),
        usernameLastChanged: data.usernameLastChanged?.toDate(),
    } as UserProfile;
};


const initializeApp = () => {
  if (typeof window !== "undefined" && !unsubscribeFromAuth) {
    unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
      const { fetchUserProfile, setUser } = useAppStoreImpl.getState();
      useAppStoreImpl.setState({ isGlobalLoading: true });
      
      if (user) {
        let profile = await fetchUserProfile(user.uid);

        // If profile doesn't exist, create a default one.
        if (!profile) {
            profile = await createDefaultProfileIfNotExists(user);
        }

        if (profile?.deactivated) {
          await updateDoc(doc(db, "users", user.uid), { deactivated: false });
          const reactivatedProfile = await fetchUserProfile(user.uid);
          setUser(user, reactivatedProfile);
        } else {
          setUser(user, profile);
        }
      } else {
        setUser(null, null);
      }
    });

    unsubscribeFromStatus = useAppStoreImpl.getState().fetchAppStatus();
  }
};

initializeApp();


export const useAppStore = useAppStoreImpl;
