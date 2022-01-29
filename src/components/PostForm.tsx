import { ChangeEventHandler, FormEventHandler, useState } from "react"

import './PostForm.css'

export const PostForm = () => {
  const [postContent, setPostContent] = useState('')

  const handleCreatePost: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if(!postContent) {
      return
    }

    try {
      const response = await fetch('http://localhost:4000/posts', {
        method: 'POST',
        body: JSON.stringify({ content: postContent }),
        headers: {
          'content-type': 'application/json'
        }
      })

      if(!response.ok) {
        alert('Error creating post')
        return
      }

      setPostContent('')
    } catch (error) {
      alert('Error creating post')
      console.log(error)
    }
  }

  const handlePostContent: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setPostContent(e.target.value)
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Create Post</h1>

      <form onSubmit={handleCreatePost} className="form">
        <textarea onChange={handlePostContent} value={postContent} className="form-textarea" rows={4} />
        <button type="submit" className="form-button">Create</button>
      </form>
    </div>
  )
}
