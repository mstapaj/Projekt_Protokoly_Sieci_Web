import "./App.css";
import { ConfirmProvider } from "material-ui-confirm";
import { BrowserRouter, Route } from "react-router-dom";
import Dashboard from "./ui/Dashboard";
import LoginPage from "./ui/LoginPage";
import RegisterPage from "./ui/RegisterPage";
import Account from "./ui/logged/account/Account";
import AuctionList from "./ui/AuctionList";
import MyAuctions from "./ui/logged/auctions/MyAuctions";
import AllAuctions from "./ui/logged/auctions/AllAuctions";
import AuctionForm from "./ui/logged/auctions/AuctionForm";
import DeleteAccount from "./ui/logged/account/DeleteAccount";
import AuctionDetails from "./ui/AuctionDetails";
import AuctionCommentForm from "./ui/logged/auctions/AuctionCommentForm";
import UserDetails from "./ui/logged/users/UserDetails";
import UserCommentForm from "./ui/logged/users/UserCommentForm";
import ChatRooms from "./ui/logged/chats/ChatRooms.js";
import ChatRoomForm from "./ui/logged/chats/ChatRoomForm";
import Chat from "./ui/logged/chats/Chat";
import DMChat from "./ui/logged/chats/DMChat";
import MyDMChats from "./ui/logged/chats/MyDMChats";
import ChangePasswordForm from "./ui/logged/account/ChangePasswordForm";
import AccountManagement from "./ui/logged/account/AccountManagement";
import EditAccount from "./ui/logged/account/EditAccount";
import AuctionsManagement from "./ui/logged/auctions/AuctionsManagement";

function App() {
    return (
        <div className="App">
            <ConfirmProvider>
                <BrowserRouter>
                    <Route exact path={"/"} component={Dashboard} />
                    <Route exact path={"/login"} component={LoginPage} />
                    <Route exact path={"/register"} component={RegisterPage} />
                    <Route exact path={"/logged/:id"} component={Account} />
                    <Route exact path={"/auctions"} component={AuctionList} />
                    <Route
                        exact
                        path={"/auctions/:auctionId"}
                        component={AuctionDetails}
                    />
                    <Route
                        exact
                        path={"/logged/:id/myAuctions"}
                        component={MyAuctions}
                    />
                    <Route
                        exact
                        path={"/logged/:id/allAuctions"}
                        component={AllAuctions}
                    />
                    <Route
                        exact
                        path={"/logged/:id/addAuction"}
                        component={AuctionForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/editAuction/:auctionId"}
                        component={AuctionForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/deleteAccount"}
                        component={DeleteAccount}
                    />
                    <Route
                        exact
                        path={`/logged/:id/auction/:auctionId`}
                        component={AuctionDetails}
                    />
                    <Route
                        exact
                        path={"/logged/:id/auction/:auctionId/addComment"}
                        component={AuctionCommentForm}
                    />
                    <Route
                        exact
                        path={
                            "/logged/:id/auction/:auctionId/editComment/:auctionCommentId"
                        }
                        component={AuctionCommentForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/user/:userId"}
                        component={UserDetails}
                    />
                    <Route
                        exact
                        path={"/logged/:id/user/:userId/addComment"}
                        component={UserCommentForm}
                    />
                    <Route
                        exact
                        path={
                            "/logged/:id/user/:userId/editComment/:userCommentId"
                        }
                        component={UserCommentForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/chats"}
                        component={ChatRooms}
                    />
                    <Route
                        exact
                        path={"/logged/:id/addChatRoom"}
                        component={ChatRoomForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/chats/:chat"}
                        component={Chat}
                    />
                    <Route
                        exact
                        path={"/logged/:id/dmchat/:chatter"}
                        component={DMChat}
                    />
                    <Route
                        exact
                        path={"/logged/:id/myDMChats"}
                        component={MyDMChats}
                    />
                    <Route
                        exact
                        path={"/logged/:id/changePassword"}
                        component={ChangePasswordForm}
                    />
                    <Route
                        exact
                        path={"/logged/:id/accountManagement"}
                        component={AccountManagement}
                    />
                    <Route
                        exact
                        path={
                            "/logged/:id/accountManagement/:userId/editAccount"
                        }
                        component={EditAccount}
                    />
                    <Route
                        exact
                        path={"/logged/:id/auctionsManagement"}
                        component={AuctionsManagement}
                    />
                </BrowserRouter>
            </ConfirmProvider>
        </div>
    );
}

export default App;
