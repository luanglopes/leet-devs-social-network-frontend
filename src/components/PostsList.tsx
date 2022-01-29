import { useEffect, useMemo, useState } from "react"

import './PostsList.css'

type Props = {
    posts: any[]
}

export const PostsList = ({ posts }: Props) => {
  const postsWithExpiration = useMemo(() => {
    return posts.map((post) => {
      const expiration = new Date(post.createdAt).getTime() + 60 * 1000 + post.likesCount * (30 * 1000)

      return { ...post, expiration }
    })
  }, [posts])

  const [fullPosts, setFullPosts] = useState(() => postsWithExpiration.map((post) => {
    const remainingTime = (post.expiration - Date.now()) / 1000

    return {...post, remainingTime}
  }))

  useEffect(() => {
    const getFullPosts = () => postsWithExpiration.map((post) => {
      const remainingTime = Math.floor((post.expiration - Date.now()) / 1000)

      return {...post, remainingTime}
    })

    setFullPosts(getFullPosts)

    const intervalId = setInterval(() => {
      setFullPosts(getFullPosts)
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [postsWithExpiration])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('http://localhost:4000/posts/like', {
        method: 'POST',
        body: JSON.stringify({ postId }),
        headers: {
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        alert('Error liking post')
      }
    } catch (error) {
      alert('Error liking post')
    }
  }

  return (
    <div className="list-container">
      {fullPosts.map((post) => (
        <div key={post._id} className="list-item">
          <p className="timer">Time remaining: {post.remainingTime} seconds</p>
          <p className="content">{post.content}</p>
          <div className="likes-counter">
            <span>{post.likesCount} Likes</span>
            <button onClick={() => handleLike(post._id)}>Like</button>
          </div>
        </div>
      ))}
    </div>
  )
}
