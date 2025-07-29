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

  // Function to build the comment trees 🌱
  function buildCommentTree(comments, parentId = null, parent = null) {
    return comments
      .filter((comment) => comment.parent_id === parentId) // Filter comments by parent_id
      .map((comment) => ({
        ...comment,
        parent,
        children: buildCommentTree(comments, comment.CommentId, comment), // Recursive call ↑ ↑
      }));
  }

  async function GetComments() {
    const morePid = localStorage.getItem("morePid");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/getComment/${morePid}`
      );

      const commentsTree = buildCommentTree(response.data); // 🌳
      setUserComments(commentsTree);
    } catch (error) {
      console.error("There was an error get comments!", error);
    }
  }

  useEffect(() => {
    GetComments();
  }, []);

  // Function to open the reply form
  function openReplyForm(commentId) {
    // If the clicked form is the same one, close it; otherwise, open a new reply form.
    setReplyingTo(replyingTo === commentId ? null : commentId);
  }

  function onReplySuccess() {
    setReplyingTo(null); // Close the reply form
    GetComments();
  }

  // Recursive function to render the comment tree.
  function renderComment(comment, depth) {
    const marginLeft = `${depth * 20}px`;
    const maxDepth = 3;
    // Set the maximum depth of the comment tree (0 = main comment, 1 = reply, 2 = reply of reply)

    return (
      <>
        <div key={comment.CommentId} style={{ marginLeft }}>
          {/* ====== comments content ====== */}
          {/* Main comments or replies */}
          <div className={depth === 0 ? "commentBlock" : "replyBlock"}>
            <h3 className="userName">{comment.name}</h3>
            {depth === 0 ? null : (
              <h3 className="replyName">{comment.parent.name}</h3>
            )}
            <p className="comment">{comment.comments}</p>
          </div>
          <div>
            {/* ====== reply button ====== */}
            {depth < maxDepth && (
              <button
                className="reply"
                onClick={() => openReplyForm(comment.CommentId)}
              >
                {replyingTo === comment.CommentId ? "取消回覆" : "回覆"}
              </button>
            )}

            {/* ====== comment time ====== */}
            <div className="commentTimeOuter">
              <small className="commentTime">{comment.created_at}</small>
            </div>
          </div>

          {/* ====== reply form ====== */}
          {replyingTo === comment.CommentId && (
            <ReplyFromTextarea
              parentCommentId={comment.CommentId}
              onSuccess={onReplySuccess}
            />
          )}

          {/* Recursively render child comments，if child comments exist，render the child comments */}
          {comment.children && comment.children.length > 0 && (
            <div className="childrenContainer" style={{ marginTop: "10px" }}>
              {comment.children.map((childComment) =>
                renderComment(childComment, depth + 1)
              )}
            </div>
          )}
        </div>
      </>
    );
  }
  /* ====== render the comment tree ====== */
  return <>{userComments.map((comment) => renderComment(comment, 0))}</>;
}

export function CommentTextarea() {
  const addComment = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");
    const morePid = localStorage.getItem("morePid");

    const formData = new FormData(event.target);
    const comment = formData.get("comment");

    if (!comment || comment.trim() === "" || comment.trim() === " ") {
      alert("評論內容不能為空白！");
      return;
    }

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

    if (!replyComment || replyComment.trim() === "" || replyComment === " ") {
      alert("評論內容不能為空白！");
      return;
    }

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
