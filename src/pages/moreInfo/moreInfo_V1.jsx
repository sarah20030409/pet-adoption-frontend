import React, { useState, useEffect } from "react";
import BackBtn from "../backBtn/backBtn";
import Loading from "../../global/Loading/Loading";
import "./moreInfo.css";
import axios from "axios";

export default function MorePage() {
  return (
    <div className="More_Page">
      <div className="Layout">
        <div className="More_backBtn">
          <BackBtn path={"/adopt"} morePid={true} />
        </div>
        <div className="Left_Info">
          <Left_Info />
        </div>

        <div className="Right_Comments">
          <Right_Comments />
        </div>
      </div>
    </div>
  );
}

export function Left_Info() {
  const morePid = localStorage.getItem("morePid");
  const [mPetInfo, setmPetInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getCurrnetPid() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/currentPet/${morePid}`
      );
      setmPetInfo(response.data[0]);
    } catch (error) {
      console.error("There was an error fetching the pet card data!", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCurrnetPid();
  }, []);

  return (
    <div className="Info">
      {loading ? (
        <Loading />
      ) : (
        <>
          <p className="name">{mPetInfo.name}</p>
          <div className="imgOutFrame">
            {/* <img className="InfoImg" src={SampleImg} /> */}
            <img
              className="InfoImg"
              src={`${process.env.REACT_APP_API_BASE_URL}/${mPetInfo.petImage}`}
              alt={mPetInfo.name}
            />
          </div>
          <div className="InfoText">
            <p className="age">
              <span className="bold">Age:</span>
              {mPetInfo.age} years old
            </p>
            <p className="variety">
              <span className="bold">Variety:</span>
              {mPetInfo.variety}
            </p>

            <div className="infoTxt">
              <p className="info_Title">
                <span className="bold">information:</span>
              </p>
              <p className="info">{mPetInfo.information}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Right_Comments() {
  return (
    <div className="comments">
      <div className="comments_Title">
        <h1>User's Comments</h1>
      </div>

      <div className="AllComments">
        <CommentBlock />
      </div>

      <div className="CommentText">
        <CommentTextarea />
      </div>
    </div>
  );
}

// 以下都是右邊區塊的元件
export function CommentBlock() {
  const [userComments, setUserComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null); // Record the user who is replying

  async function GetComments() {
    const morePid = localStorage.getItem("morePid");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/getComment/${morePid}`
      );

      // Organize the reply information

      // ※ All comments
      const allComments = response.data;
      // ※ Main comments
      const mainComments = allComments.filter((comment) => !comment.parent_id);
      // ※ replies of main comments
      const replies = allComments.filter((comment) => comment.parent_id);

      // Place the reply message under the corresponding main message

      const commentsWithReplies = mainComments.map((mainComment) => ({
        ...mainComment,
        replies: replies.filter(
          (reply) => reply.parent_id === mainComment.CommentId
        ),
      }));

      setUserComments(commentsWithReplies); // Update the userComments state.
    } catch (error) {
      console.error("There was an error get comments!", error);
    }
  }

  useEffect(() => {
    GetComments();
  }, []);

  // Function to open the reply form
  function openReplyForm(commentId) {
    // If the clicked form is the same one, close it; otherwise, open a new reply form
    setReplyingTo(replyingTo === commentId ? null : commentId);
  }

  function onReplySuccess() {
    setReplyingTo(null); // Close the reply form
    GetComments();
  }

  return (
    <>
      {userComments.map((userComment, i) => (
        <div key={i}>
          <div className="commentBlock">
            <h3 className="userName">{userComment.name}:</h3>
            <p className="comment">{userComment.comments}</p>
          </div>
          <div>
            <button
              className="reply"
              onClick={() => openReplyForm(userComment.CommentId)}
            >
              {replyingTo === userComment.CommentId ? "取消回覆" : "回覆"}
            </button>
            <div className="commentTimeOuter">
              <small className="commentTime">{userComment.created_at}</small>
            </div>
          </div>

          {/* ====== replies ====== */}
          {userComment.replies && userComment.replies.length > 0 && (
            <div
              className="repliesContainer"
              style={{ marginLeft: "30px", marginTop: "10px" }}
            >
              {userComment.replies.map((reply, replyIndex) => (
                <div key={replyIndex}>
                  <div className="replyBlock">
                    <h4 className="userName">{reply.name}</h4>
                    <h4 className="replyName">{userComment.name}</h4>
                    <p className="comment">{reply.comments}</p>
                  </div>
                  <button
                    className="reply"
                    onClick={() => openReplyForm(reply.CommentId)}
                  >
                    {replyingTo === reply.CommentId ? "取消回覆" : "回覆"}
                  </button>
                  <div className="commentTimeOuter">
                    <small className="commentTime">{reply.created_at}</small>
                  </div>
                  {replyingTo === reply.CommentId && (
                    <ReplyFromTextarea
                      parentCommentId={reply.CommentId}
                      onSuccess={onReplySuccess}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {/* ====== ===== ===== */}

          {replyingTo === userComment.CommentId && (
            <ReplyFromTextarea
              parentCommentId={userComment.CommentId}
              onSuccess={onReplySuccess}
            />
          )}
        </div>
      ))}
    </>
  );
}

export function CommentTextarea() {
  const addComment = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");
    const morePid = localStorage.getItem("morePid");

    const formData = new FormData(event.target);
    const comment = formData.get("comment");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/saveComment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, morePid, comment }),
        }
      );

      const data = await response.json();
      //   console.log(data);

      if (data.success) {
        event.target.reset();
        window.location.reload();
      } else {
        alert(`Add comment failed! ${data.error}`);
      }
    } catch (error) {
      console.error("There was an error inserting current pet data!", error);
    }
  };

  return (
    <form className="commentForm" onSubmit={addComment}>
      <input
        className="commentInput"
        name="comment"
        type="text"
        placeholder="Comments.."
        autoComplete="off"
        maxLength="100"
        required
      ></input>
      <input className="sendBTN" type="submit" value="→"></input>
    </form>
  );
}

// increase reply form component.
export function ReplyFromTextarea({ parentCommentId, onSuccess }) {
  const addReply = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");
    const morePid = localStorage.getItem("morePid");

    const formData = new FormData(event.target);
    const replyComment = formData.get("replyComment");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/saveReply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            morePid,
            parentCommentId,
            replyComment,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        event.target.reset();
        onSuccess(); // Call the onSuccess callback
      } else {
        alert(`Add reply failed! ${data.error}`);
      }
    } catch (error) {
      console.error("There was an error inserting current pet data!", error);
    }
  };

  return (
    <form
      className="replyForm"
      onSubmit={addReply}
      style={{ marginLeft: "20px", marginTop: "10px" }}
    >
      <input
        className="commentInput"
        name="replyComment"
        type="text"
        placeholder="回覆留言..."
        autoComplete="off"
        maxLength="100"
        required
      />
      <input className="sendBTN" type="submit" value="→" />
    </form>
  );
}
