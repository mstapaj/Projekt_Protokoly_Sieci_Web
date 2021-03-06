import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory, useParams } from "react-router-dom";
import * as mqtt from "mqtt";
import _ from "lodash";
import { Button } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import Notification from "../Notification";
import SnackbarComponent from "../../SnackbarComponent";

const UserDetails = () => {
    const params = useParams();
    const history = useHistory();
    const [data, setData] = useState([]);
    const [client, setClient] = useState(null);
    const [dms, setDms] = useState([]);
    const [like, setLike] = useState([]);
    const [dislike, setDislike] = useState([]);
    const [userCommentsLike, setUserCommentsLikes] = useState([]);
    const [userCommentsDislike, setUserCommentsDislikes] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [tempLike, setTempLike] = useState(null);
    const [tempDislike, setTempDislike] = useState(null);
    const [errorType, setErrorType] = useState("info");
    const [alertMessage, setAlertMessage] = useState("");
    const confirm = useConfirm();
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };
    const getData = () => {
        axios
            .get(`https://localhost:5000/users/${params.userId}`)
            .then((res) => {
                if (res.status === 200) {
                    setData(res.data);
                    setUserCommentsLikes(
                        res.data.comments.reduce((acc, curr) => {
                            return [...acc, { id: curr._id, likes: [] }];
                        }, [])
                    );
                    setUserCommentsDislikes(
                        res.data.comments.reduce((acc, curr) => {
                            return [...acc, { id: curr._id, dislikes: [] }];
                        }, [])
                    );
                    for (let i = 0; i < res.data.comments.length; i++) {
                        client.subscribe(res.data.comments[i]._id);
                        client.publish(res.data.comments[i]._id, "GL");
                    }
                } else {
                    setErrorType("error");
                    setAlertMessage("B????d ??adowania danych");
                    handleClick();
                }
            });
    };
    const mqttConnect = (host, mqttOption) => {
        setClient(mqtt.connect(host, mqttOption));
    };
    useEffect(() => {
        mqttConnect("mqtt://127.0.0.1:1884", {
            connectTimeout: 5000,
            path: "/mqtt",
        });
    }, []);
    useEffect(() => {
        if (client) {
            getData();
            client.on("connect", () => {
                client.subscribe("DMChats");
                client.subscribe(params.userId);
                client.publish(params.userId, "GL");
                client.publish("DMChats", "getDM");
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = { topic, message: message.toString() };
                if (
                    payload.topic === "DMChats" &&
                    payload.message !== "getDM"
                ) {
                    if (
                        dms !==
                        payload.message.split("~").filter((n) => n !== "")
                    ) {
                        setDms(
                            payload.message.split("~").filter((n) => n !== "")
                        );
                    }
                } else if (
                    payload.topic === params.userId &&
                    payload.message[0] === "L"
                ) {
                    setLike([
                        ...payload.message
                            .slice(1)
                            .split("~")
                            .filter((n) => n !== ""),
                    ]);
                } else if (
                    payload.topic === params.userId &&
                    payload.message[0] === "D"
                ) {
                    setDislike([
                        ...payload.message
                            .slice(1)
                            .split("~")
                            .filter((n) => n !== ""),
                    ]);
                } else if (userCommentsLike && payload.message[0] === "L") {
                    setTempLike(payload);
                } else if (userCommentsDislike && payload.message[0] === "D") {
                    setTempDislike(payload);
                }
            });
        }
    }, [client]);

    useEffect(() => {
        if (tempLike) {
            if (userCommentsLike.find((n) => n.id === tempLike.topic)) {
                setUserCommentsLikes([
                    ...userCommentsLike.map((n) =>
                        n.id === tempLike.topic
                            ? {
                                  id: tempLike.topic,
                                  likes: [
                                      ...tempLike.message
                                          .slice(1)
                                          .split("~")
                                          .filter((n) => n !== ""),
                                  ],
                              }
                            : n
                    ),
                ]);
            } else {
                setUserCommentsLikes([
                    ...userCommentsLike,
                    {
                        id: tempLike.topic,
                        likes: [
                            ...tempLike.message
                                .slice(1)
                                .split("~")
                                .filter((n) => n !== ""),
                        ],
                    },
                ]);
            }
        }
    }, [tempLike]);

    useEffect(() => {
        if (tempDislike) {
            if (userCommentsDislike.find((n) => n.id === tempDislike.topic)) {
                setUserCommentsDislikes([
                    ...userCommentsDislike.map((n) =>
                        n.id === tempDislike.topic
                            ? {
                                  id: tempDislike.topic,
                                  dislikes: [
                                      ...tempDislike.message
                                          .slice(1)
                                          .split("~")
                                          .filter((n) => n !== ""),
                                  ],
                              }
                            : n
                    ),
                ]);
            } else {
                setUserCommentsDislikes([
                    ...userCommentsDislike,
                    {
                        id: tempDislike.topic,
                        dislikes: [
                            ...tempDislike.message
                                .slice(1)
                                .split("~")
                                .filter((n) => n !== ""),
                        ],
                    },
                ]);
            }
        }
    }, [tempDislike]);

    return (
        <div className={"auction-details"}>
            <h3>Profil u??ytkownika {data.login}</h3>
            <div className={"details"}>
                <p>
                    Polecam: {like.length - 1}{" "}
                    {params.id.toString() !== "undefined" &&
                        params.id !== params.userId && (
                            <Button
                                onClick={() => {
                                    dislike.includes(params.id)
                                        ? setAlertMessage(
                                              "Mo??esz tylko poleci?? lub odradzi?? danego u??ytkownika"
                                          ) ||
                                          setErrorType("warning") ||
                                          handleClick()
                                        : like.includes(params.id)
                                        ? client.publish(
                                              params.userId,
                                              `-L${params.id}`
                                          )
                                        : client.publish(
                                              params.userId,
                                              `+L${params.id}`
                                          );
                                }}
                            >
                                Pole??
                            </Button>
                        )}
                </p>
                <p>
                    Nie polecam: {dislike.length - 1}{" "}
                    {params.id.toString() !== "undefined" &&
                        params.id !== params.userId && (
                            <Button
                                onClick={() => {
                                    like.includes(params.id)
                                        ? setAlertMessage(
                                              "Mo??esz tylko poleci?? lub odradzi?? danego u??ytkownika"
                                          ) ||
                                          setErrorType("warning") ||
                                          handleClick()
                                        : dislike.includes(params.id)
                                        ? client.publish(
                                              params.userId,
                                              `-D${params.id}`
                                          )
                                        : client.publish(
                                              params.userId,
                                              `+D${params.id}`
                                          );
                                }}
                            >
                                Odrad??
                            </Button>
                        )}
                </p>
                <p>
                    ??rednio{" "}
                    {isNaN(
                        Math.round(
                            ((like.length - 1) /
                                (like.length - 1 + dislike.length - 1)) *
                                100 *
                                100
                        ) / 100
                    )
                        ? 0
                        : Math.round(
                              ((like.length - 1) /
                                  (like.length - 1 + dislike.length - 1)) *
                                  100 *
                                  100
                          ) / 100}
                    % os??b poleca tego u??ytkownika
                </p>
                {data.auctions && data.auctions.length > 0 && (
                    <p>Aukcje tego u??ytkownika</p>
                )}
                {data.auctions && data.auctions.length > 0 && (
                    <div className={"user-auctions"}>
                        <div>
                            {data.auctions.map((n) => (
                                <div
                                    id={n._id}
                                    onClick={() =>
                                        history.push(
                                            `/logged/${params.id}/auction/${n._id}`
                                        )
                                    }
                                >
                                    <p>{n.name}</p>
                                    <p>Cena: {n.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {params.id.toString() !== "undefined" &&
                params.id !== params.userId ? (
                    <Button
                        onClick={() =>
                            history.push(
                                `/logged/${params.id}/user/${params.userId}/addComment`
                            )
                        }
                    >
                        Dodaj komentarz
                    </Button>
                ) : null}
                {data.comments &&
                    data.comments.length > 0 &&
                    (showComments ? (
                        <Button onClick={() => setShowComments(false)}>
                            Zwi?? komentarze
                        </Button>
                    ) : (
                        <Button onClick={() => setShowComments(true)}>
                            Poka?? komentarze
                        </Button>
                    ))}
                {params.id.toString() !== "undefined" &&
                params.id !== params.userId ? (
                    dms.includes(
                        `${_.sortBy([params.id, params.userId])[0]}:${
                            _.sortBy([params.id, params.userId])[1]
                        }`
                    ) ? (
                        <Button
                            onClick={() =>
                                history.push(
                                    `/logged/${params.id}/dmchat/${params.userId}`
                                )
                            }
                        >
                            Otw??rz czat z u??ytkownkiem
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                client.publish(
                                    "addDM",
                                    `${
                                        _.sortBy([params.id, params.userId])[0]
                                    }:${
                                        _.sortBy([params.id, params.userId])[1]
                                    }`
                                );
                                client.publish(
                                    params.userId,
                                    `newDM${params.id}`
                                );
                                history.push(
                                    `/logged/${params.id}/dmchat/${params.userId}`
                                );
                            }}
                        >
                            Rozpocznij czat z tym u??ytkownikiem
                        </Button>
                    )
                ) : null}
                <Button onClick={() => history.goBack()}>Powr??t</Button>
                {data.comments && data.comments.length > 0
                    ? showComments && (
                          <div className={"comments"}>
                              <div className={"comments-list"}>
                                  {data.comments.map((n) => (
                                      <div key={n._id}>
                                          <div className={"content"}>
                                              {n.type ? (
                                                  <div>Komentarz pozytywny</div>
                                              ) : (
                                                  <div>Komentarz negatywny</div>
                                              )}
                                              <div>Tre????: {n.comment}</div>
                                          </div>
                                          <div className={"likes"}>
                                              {userCommentsLike &&
                                                  userCommentsLike.length >
                                                      0 && (
                                                      <p>
                                                          Lubi??:{" "}
                                                          {userCommentsLike.find(
                                                              (k) =>
                                                                  k.id === n._id
                                                          ).likes.length -
                                                              1}{" "}
                                                      </p>
                                                  )}
                                              {userCommentsDislike &&
                                                  userCommentsDislike.length >
                                                      0 && (
                                                      <p>
                                                          Nie lubi??:{" "}
                                                          {userCommentsDislike.find(
                                                              (k) =>
                                                                  k.id === n._id
                                                          ).dislikes.length -
                                                              1}{" "}
                                                      </p>
                                                  )}
                                              <Button
                                                  onClick={() => {
                                                      !params.id ||
                                                      params.id.toString() ===
                                                          "undefined"
                                                          ? setAlertMessage(
                                                                "Musisz si?? zalogowa??, aby m??c zaregowa?? na dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : userCommentsDislike
                                                                .filter(
                                                                    (k) =>
                                                                        k.id ===
                                                                        n._id
                                                                )[0]
                                                                .dislikes.includes(
                                                                    params.id
                                                                )
                                                          ? setAlertMessage(
                                                                "Mo??esz tylko polubi?? lub nie polubi?? dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : userCommentsLike
                                                                .filter(
                                                                    (k) =>
                                                                        k.id ===
                                                                        n._id
                                                                )[0]
                                                                .likes.includes(
                                                                    params.id
                                                                )
                                                          ? client.publish(
                                                                n._id,
                                                                `-L${params.id}`
                                                            )
                                                          : client.publish(
                                                                n._id,
                                                                `+L${params.id}`
                                                            );
                                                  }}
                                              >
                                                  Polub
                                              </Button>
                                              <Button
                                                  onClick={() => {
                                                      !params.id ||
                                                      params.id.toString() ===
                                                          "undefined"
                                                          ? setAlertMessage(
                                                                "Musisz si?? zalogowa??, aby m??c zaregowa?? na dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : userCommentsLike
                                                                .filter(
                                                                    (k) =>
                                                                        k.id ===
                                                                        n._id
                                                                )[0]
                                                                .likes.includes(
                                                                    params.id
                                                                )
                                                          ? setAlertMessage(
                                                                "Mo??esz tylko polubi?? lub nie polubi?? dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : userCommentsDislike
                                                                .filter(
                                                                    (k) =>
                                                                        k.id ===
                                                                        n._id
                                                                )[0]
                                                                .dislikes.includes(
                                                                    params.id
                                                                )
                                                          ? client.publish(
                                                                n._id,
                                                                `-D${params.id}`
                                                            )
                                                          : client.publish(
                                                                n._id,
                                                                `+D${params.id}`
                                                            );
                                                  }}
                                              >
                                                  Nie polub
                                              </Button>
                                          </div>
                                          <div className={"buttons"}>
                                              {n.author === params.id ||
                                              params.id ===
                                                  "000000000000000000000000" ? (
                                                  <div>
                                                      <Button
                                                          onClick={() =>
                                                              history.push(
                                                                  `/logged/${params.id}/user/${params.userId}/editComment/${n._id}`
                                                              )
                                                          }
                                                      >
                                                          Edytuj komentarz
                                                      </Button>
                                                      <Button
                                                          onClick={() =>
                                                              confirm({
                                                                  title: "Czy na pewno chcesz usnun???? ten komentarz?",
                                                                  confirmationText:
                                                                      "Usu?? komentarz",
                                                                  cancellationText:
                                                                      "Anuluj",
                                                              })
                                                                  .then(() => {
                                                                      axios
                                                                          .delete(
                                                                              `https://localhost:5000/userComments/deleteUserComment/${n._id}`
                                                                          )
                                                                          .then(
                                                                              (
                                                                                  res
                                                                              ) => {
                                                                                  if (
                                                                                      res.status ===
                                                                                      200
                                                                                  ) {
                                                                                      setErrorType(
                                                                                          "success"
                                                                                      );
                                                                                      setAlertMessage(
                                                                                          "Uda??o si?? usun???? komentarz"
                                                                                      );
                                                                                      handleClick();
                                                                                      getData();
                                                                                  } else {
                                                                                      setErrorType(
                                                                                          "error"
                                                                                      );
                                                                                      setAlertMessage(
                                                                                          "Nie uda??o si?? usn???? komentarza"
                                                                                      );
                                                                                      handleClick();
                                                                                  }
                                                                              }
                                                                          );
                                                                  })
                                                                  .catch(
                                                                      () => {}
                                                                  )
                                                          }
                                                      >
                                                          Usu?? komentarz
                                                      </Button>
                                                  </div>
                                              ) : null}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                    : null}
                <SnackbarComponent
                    alertMessage={alertMessage}
                    errorType={errorType}
                    handleClose={handleClose}
                    open={open}
                />
                <Notification />
            </div>
        </div>
    );
};

export default UserDetails;
