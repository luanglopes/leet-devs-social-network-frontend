import { useEffect, useRef, useState } from 'react';
import { PostForm } from './components/PostForm';
import { PostsList } from './components/PostsList';

import { socket } from './socket';

import './App.css'

export const App = () => {
  const [posts, setPosts] = useState<any[]>([])
  const loadedInitialPosts = useRef(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('post-liked', (data) => {
      if (loadedInitialPosts.current) {
        setPosts((currentPosts) => {
          return currentPosts.map((post) => {
            if(post._id !== data.postId) {
              return post
            }

            if(post.timeOutId) {
              clearTimeout(post.timeOutId)
            }

            const updatedPost = { ...post, likesCount: post.likesCount + 1 }

            const expiration = new Date(updatedPost.createdAt).getTime() + 60 * 1000 + updatedPost.likesCount * (30 * 1000)

            const timeFromNow = expiration - Date.now()

            const timeOutId = setTimeout(() => {
              setPosts((currentPosts) => currentPosts.filter(_post => _post._id !== updatedPost._id))
            }, timeFromNow)

            return { ...updatedPost, timeOutId }
          })
        })
      }
    })

    socket.on('post-created', (data) => {
      if (loadedInitialPosts.current) {
        setPosts((currentPosts) => {
          const expiration = new Date(data.createdAt).getTime() + 60 * 1000 + data.likesCount * (30 * 1000)

          const timeFromNow = expiration - Date.now()

          const timeOutId = setTimeout(() => {
            setPosts((currentPosts) => currentPosts.filter(_post => _post._id !== post._id))
          }, timeFromNow)

          const post = {
            ...data,
            timeOutId
          }
          return [post, ...currentPosts]
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const response = await fetch('http://localhost:4000/posts')

        if(!response.ok) {
          alert('Error loading posts')
          return
        }

        const posts = await response.json()

        setPosts(posts.map((post: any) => {
          if(post.timeOutId) {
            clearTimeout(post.timeOutId)
          }

          const expiration = new Date(post.createdAt).getTime() + 60 * 1000 + post.likesCount * (30 * 1000)

          const timeFromNow = expiration - Date.now()

          const timeOutId = setTimeout(() => {
            setPosts((currentPosts) => currentPosts.filter(_post => _post._id !== post._id))
          }, timeFromNow)

          return { ...post, timeOutId }
        }))

        loadedInitialPosts.current = true
      } catch (error) {
        alert('Error loading posts')
      }
    }

    fetchInitialPosts()
  }, [])

  return (
    <div className="app">
      <PostForm />
      <PostsList posts={posts} />
    </div>
  )
}

export default App;
