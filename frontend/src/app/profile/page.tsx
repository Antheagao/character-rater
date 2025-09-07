"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserActivity {
  likes: any[];
  comments: any[];
}

export default function Profile() {
  const { user, loading, token } = useUser();
  const router = useRouter();
  const [userActivity, setUserActivity] = useState<UserActivity>({ likes: [], comments: [] });
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && token) {
      fetchUserActivity();
    }
  }, [user, token]);

  const fetchUserActivity = async () => {
    try {
      setActivityLoading(true);
      // Fetch user's likes and comments
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setUserActivity(prev => ({ ...prev, likes: likesData.likes || [] }));
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setUserActivity(prev => ({ ...prev, comments: commentsData.comments || [] }));
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage your account and view your activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Info Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Username
              </label>
              <p className="mt-1 text-lg font-semibold">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Email
              </label>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>

            {user.bio && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Bio
                </label>
                <p className="mt-1 text-lg">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
          {activityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">Loading activity...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userActivity.likes.length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Likes</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userActivity.comments.length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Comments</div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userActivity.likes.filter(like => like.value === 1).length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Characters Liked</div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {userActivity.likes.filter(like => like.value === -1).length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Characters Disliked</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {activityLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Loading recent activity...</p>
          </div>
        ) : userActivity.likes.length === 0 && userActivity.comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600 dark:text-neutral-400">No activity yet</p>
            <p className="text-sm mt-2">Start liking and commenting on characters to see your activity here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display recent likes */}
            {userActivity.likes.slice(0, 5).map((like) => (
              <div key={like.id} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  like.value === 1 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {like.value === 1 ? 'Liked' : 'Disliked'}
                </span>
                <span className="text-sm">
                  Character #{like.characterId}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(like.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}

            {/* Display recent comments */}
            {userActivity.comments.slice(0, 5).map((comment) => (
              <div key={comment.id} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium">
                    Commented
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{comment.content}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  on Character #{comment.characterId}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
