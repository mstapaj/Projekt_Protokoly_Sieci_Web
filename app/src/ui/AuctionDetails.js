import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory, useParams } from "react-router-dom";
import * as mqtt from "mqtt";
import Navbar from "./Navbar";
import { Button } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import Notification from "./logged/Notification";
import SnackbarComponent from "./SnackbarComponent";

const AuctionDetails = () => {
    const params = useParams();
    const history = useHistory();
    const [data, setData] = useState([]);
    const [client, setClient] = useState(null);
    const [auctionCommentsLike, setauctionCommentsLikes] = useState([]);
    const [auctionCommentsDislike, setauctionCommentsDislikes] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [tempLike, setTempLike] = useState(null);
    const [tempDislike, setTempDislike] = useState(null);
    const [watchers, setWatchers] = useState([]);
    const [tempWatchers, setTempWatchers] = useState([]);
    const [views, setViews] = useState(0);
    const [tempViews, setTempViews] = useState(0);
    const [amount, setAmount] = useState(0);
    const [tempAmount, setTempAmount] = useState(0);
    const [errorType, setErrorType] = useState("info");
    const [alertMessage, setAlertMessage] = useState("");
    const confirm = useConfirm();

    const getData = () => {
        axios
            .get(`https://localhost:5000/auctions/${params.auctionId}`)
            .then((res) => {
                if (res.status === 200) {
                    setData(res.data);
                    setViews(res.data.views);
                    setAmount(res.data.amount);
                    setauctionCommentsLikes(
                        res.data.comments.reduce((acc, curr) => {
                            return [...acc, { id: curr._id, likes: [] }];
                        }, [])
                    );
                    setauctionCommentsDislikes(
                        res.data.comments.reduce((acc, curr) => {
                            return [...acc, { id: curr._id, dislikes: [] }];
                        }, [])
                    );
                    for (let i = 0; i < res.data.comments.length; i++) {
                        client.subscribe(res.data.comments[i]._id);
                        client.publish(res.data.comments[i]._id, "GL");
                    }
                } else {
                    alert("B????d ??adowania danych");
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
                client.subscribe(params.auctionId);
                client.publish(params.auctionId, "GL");
                client.publish(params.auctionId, `+W${params.id}`);
            });
            client.on("error", (err) => {
                console.error("Connection error: ", err);
                client.end();
            });
            client.on("message", (topic, message) => {
                const payload = { topic, message: message.toString() };
                if (auctionCommentsLike && payload.message[0] === "L") {
                    setTempLike(payload);
                } else if (
                    auctionCommentsDislike &&
                    payload.message[0] === "D"
                ) {
                    setTempDislike(payload);
                } else if (payload.message[0] === "W") {
                    setTempWatchers(payload.message.slice(1).split("~"));
                } else if (payload.message[0] === "V") {
                    setTempViews(payload.message.slice(1));
                } else if (payload.message[0] === "A") {
                    setTempAmount(payload.message.split("~")[1]);
                    if (payload.message.split("~")[2] !== params.id) {
                        setErrorType("info");
                        setAlertMessage("Kto?? w??asnie kupi?? ten produkt");
                        handleClick();
                    }
                }
            });
        }
    }, [client]);

    useEffect(() => {
        setWatchers(tempWatchers);
    }, [tempWatchers]);

    useEffect(() => {
        setViews(tempViews);
    }, [tempViews]);

    useEffect(() => {
        setAmount(tempAmount);
    }, [tempAmount]);

    useEffect(() => {
        if (tempLike) {
            if (auctionCommentsLike.find((n) => n.id === tempLike.topic)) {
                setauctionCommentsLikes([
                    ...auctionCommentsLike.map((n) =>
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
                setauctionCommentsLikes([
                    ...auctionCommentsLike,
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
            if (
                auctionCommentsDislike.find((n) => n.id === tempDislike.topic)
            ) {
                setauctionCommentsDislikes([
                    ...auctionCommentsDislike.map((n) =>
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
                setauctionCommentsDislikes([
                    ...auctionCommentsDislike,
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

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    return (
        <div className={"auction-details"}>
            <h3>Szczeg????y aukcji</h3>
            {params.id && params.id.toString() !== "undefined" ? null : (
                <Navbar />
            )}
            <div className={"details"}>
                <p>Nazwa: {data.name}</p>
                <p>Cena: {data.price}</p>
                <p>Opis produktu: {data.description}</p>
                <p>Ilo???? produktu w magazynie: {amount}</p>
                <p>
                    Ilo???? os??b obecnie ogl??daj??cych produkt:{" "}
                    {watchers.length - 1}
                </p>
                <p>Wy??wietlenia produktu: {views}</p>
                {data.user ? (
                    <p
                        className={"clickable"}
                        onClick={() => {
                            client.publish(params.auctionId, `-W${params.id}`);
                            history.push(
                                `/logged/${params.id}/user/${data.user._id}`
                            );
                        }}
                    >
                        Aukcja u??ytkownika: {data.user.login}
                    </p>
                ) : null}
                {params.id &&
                    params.id.toString() !== "undefined" &&
                    amount > 0 &&
                    data.user &&
                    params.id !== data.user._id && (
                        <Button
                            variant={"text"}
                            onClick={() => {
                                confirm({
                                    title: "Czy na pewno chcesz kupi?? ten przedmiot?",
                                    confirmationText: "Kup",
                                    cancellationText: "Anuluj",
                                })
                                    .then(() => {
                                        client.publish(
                                            data.user._id,
                                            `buyIT${data._id}`
                                        );
                                        client.publish(
                                            params.auctionId,
                                            `-A${params.id}`
                                        );
                                    })
                                    .catch(() => {});
                            }}
                        >
                            Kup ten przedmiot
                        </Button>
                    )}
                {data.comments &&
                    data.comments.length > 0 &&
                    (showComments ? (
                        <Button
                            variant={"text"}
                            onClick={() => setShowComments(false)}
                        >
                            Zwi?? komentarze
                        </Button>
                    ) : (
                        <Button
                            variant={"text"}
                            onClick={() => setShowComments(true)}
                        >
                            Poka?? komentarze
                        </Button>
                    ))}
                {params.id && params.id.toString() !== "undefined" ? (
                    data.user && data.user._id !== params.id ? (
                        <Button
                            variant={"text"}
                            onClick={() => {
                                client.publish(
                                    params.auctionId,
                                    `-W${params.id}`
                                );
                                history.push(
                                    `/logged/${params.id}/auction/${params.auctionId}/addComment`
                                );
                            }}
                        >
                            Dodaj komentarz
                        </Button>
                    ) : (
                        <Button
                            variant={"text"}
                            onClick={() => {
                                setAlertMessage(
                                    "Nie mo??esz doda?? komentarza do swojej aukcji"
                                );
                                setErrorType("warning");
                                handleClick();
                            }}
                        >
                            Dodaj komentarz
                        </Button>
                    )
                ) : (
                    <Button
                        variant={"text"}
                        onClick={() => {
                            setAlertMessage(
                                "Musisz by?? zalogowany, aby dodawa?? komentarze"
                            );
                            setErrorType("warning");
                            handleClick();
                        }}
                    >
                        Dodaj komentarz
                    </Button>
                )}
                <Button
                    variant={"text"}
                    onClick={() => {
                        client.publish(params.auctionId, `-W${params.id}`);
                        history.goBack();
                    }}
                >
                    Powr??t
                </Button>
                {data.comments && data.comments.length > 0
                    ? showComments && (
                          <div className={"comments"}>
                              <div className={"comments-list"}>
                                  {data.comments.map((n) => (
                                      <div key={n._id}>
                                          <div className={"content"}>
                                              {n.type ? (
                                                  <div>
                                                      {" "}
                                                      Komentarz pozytywny
                                                  </div>
                                              ) : (
                                                  <div>
                                                      {" "}
                                                      Komentarz negatywny
                                                  </div>
                                              )}
                                              <div>Tre????: {n.comment}</div>
                                          </div>
                                          <div className={"likes"}>
                                              {auctionCommentsLike &&
                                                  auctionCommentsLike.length >
                                                      0 && (
                                                      <p>
                                                          Ilo???? polubie??:{" "}
                                                          {auctionCommentsLike.find(
                                                              (k) =>
                                                                  k.id === n._id
                                                          ).likes.length -
                                                              1}{" "}
                                                      </p>
                                                  )}
                                              {auctionCommentsDislike &&
                                                  auctionCommentsDislike.length >
                                                      0 && (
                                                      <p>
                                                          Ilo???? reakcji nie
                                                          lubi??:{" "}
                                                          {auctionCommentsDislike.find(
                                                              (k) =>
                                                                  k.id === n._id
                                                          ).dislikes.length -
                                                              1}{" "}
                                                      </p>
                                                  )}
                                              <Button
                                                  variant={"text"}
                                                  onClick={() => {
                                                      !params.id
                                                          ? setAlertMessage(
                                                                "Musisz si?? zalogowa??, aby m??c zaregowa?? na dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : auctionCommentsDislike
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
                                                          : auctionCommentsLike
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
                                                  Lubi??
                                              </Button>
                                              <Button
                                                  variant={"text"}
                                                  onClick={() => {
                                                      !params.id
                                                          ? setAlertMessage(
                                                                "Musisz si?? zalogowa??, aby m??c zaregowa?? na dany komentarz"
                                                            ) ||
                                                            setErrorType(
                                                                "warning"
                                                            ) ||
                                                            handleClick()
                                                          : auctionCommentsLike
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
                                                          : auctionCommentsDislike
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
                                                  Nie lubi??
                                              </Button>
                                          </div>
                                          <div className={"buttons"}>
                                              {n.author === params.id ||
                                              params.id ===
                                                  "000000000000000000000000" ? (
                                                  <div>
                                                      <Button
                                                          variant={"text"}
                                                          onClick={() =>
                                                              history.push(
                                                                  `/logged/${params.id}/auction/${params.auctionId}/editComment/${n._id}`
                                                              )
                                                          }
                                                      >
                                                          Edytuj komentarz
                                                      </Button>
                                                      <Button
                                                          variant={"text"}
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
                                                                              `https://localhost:5000/auctionComments/deleteAuctionComment/${n._id}`
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
            </div>
            <Notification />
        </div>
    );
};

export default AuctionDetails;
