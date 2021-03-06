// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View
} from 'react-native';
import FlatList from 'app/components/inverted_flat_list';

import {General} from 'mattermost-redux/constants';
import {addDatesToPostList} from 'mattermost-redux/utils/post_utils';

import ChannelIntro from 'app/components/channel_intro';
import Post from 'app/components/post';
import DateHeader from './date_header';
import LoadMorePosts from './load_more_posts';
import NewMessagesDivider from './new_messages_divider';

const LOAD_MORE_POSTS = 'load-more-posts';

export default class PostList extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            refreshChannelWithRetry: PropTypes.func.isRequired
        }).isRequired,
        channelId: PropTypes.string,
        currentUserId: PropTypes.string,
        indicateNewMessages: PropTypes.bool,
        isLoadingMore: PropTypes.bool,
        isSearchResult: PropTypes.bool,
        lastViewedAt: PropTypes.number,
        loadMore: PropTypes.func,
        navigator: PropTypes.object,
        onPostPress: PropTypes.func,
        onRefresh: PropTypes.func,
        posts: PropTypes.array.isRequired,
        refreshing: PropTypes.bool,
        renderReplies: PropTypes.bool,
        showLoadMore: PropTypes.bool,
        shouldRenderReplyButton: PropTypes.bool,
        theme: PropTypes.object.isRequired
    };

    getPostsWithDates = () => {
        const {posts, indicateNewMessages, currentUserId, lastViewedAt, showLoadMore} = this.props;
        const list = addDatesToPostList(posts, {indicateNewMessages, currentUserId, lastViewedAt});

        if (showLoadMore) {
            return [...list, LOAD_MORE_POSTS];
        }

        return list;
    };

    keyExtractor = (item) => {
        if (item instanceof Date) {
            return item.getTime();
        }
        if (item === General.START_OF_NEW_MESSAGES || item === LOAD_MORE_POSTS) {
            return item;
        }

        return item.id;
    };

    loadMorePosts = () => {
        const {loadMore, isLoadingMore} = this.props;
        if (typeof loadMore === 'function' && !isLoadingMore) {
            loadMore();
        }
    };

    onRefresh = () => {
        const {
            actions,
            channelId,
            onRefresh
        } = this.props;

        if (channelId) {
            actions.refreshChannelWithRetry(channelId);
        }

        if (onRefresh) {
            onRefresh();
        }
    };

    renderChannelIntro = () => {
        const {channelId, navigator, refreshing, showLoadMore} = this.props;

        if (channelId && !showLoadMore && !refreshing) {
            return (
                <View>
                    <ChannelIntro navigator={navigator}/>
                </View>
            );
        }

        return null;
    };

    renderDateHeader = (date) => {
        return (
            <DateHeader
                theme={this.props.theme}
                date={date}
            />
        );
    };

    renderItem = ({item}) => {
        if (item instanceof Date) {
            return this.renderDateHeader(item);
        }
        if (item === General.START_OF_NEW_MESSAGES) {
            return (
                <NewMessagesDivider
                    theme={this.props.theme}
                />
            );
        }
        if (item === LOAD_MORE_POSTS && this.props.showLoadMore) {
            return (
                <LoadMorePosts
                    loading={this.props.isLoadingMore}
                    theme={this.props.theme}
                />
            );
        }

        return this.renderPost(item);
    };

    getItem = (data, index) => data[index];

    getItemCount = (data) => data.length;

    renderPost = (post) => {
        const {
            isSearchResult,
            navigator,
            onPostPress,
            renderReplies,
            shouldRenderReplyButton
        } = this.props;

        return (
            <Post
                post={post}
                renderReplies={renderReplies}
                isFirstReply={post.isFirstReply}
                isLastReply={post.isLastReply}
                isSearchResult={isSearchResult}
                shouldRenderReplyButton={shouldRenderReplyButton}
                commentedOnPost={post.commentedOnPost}
                onPress={onPostPress}
                navigator={navigator}
            />
        );
    };

    render() {
        const {channelId, refreshing, theme} = this.props;

        const refreshControl = {
            refreshing
        };

        if (channelId) {
            refreshControl.onRefresh = this.onRefresh;
        }

        return (
            <FlatList
                data={this.getPostsWithDates()}
                initialNumToRender={20}
                inverted={true}
                keyExtractor={this.keyExtractor}
                ListFooterComponent={this.renderChannelIntro}
                onEndReached={this.loadMorePosts}
                onEndReachedThreshold={0}
                {...refreshControl}
                renderItem={this.renderItem}
                theme={theme}
                getItem={this.getItem}
                getItemCount={this.getItemCount}
                contentContainerStyle={styles.postListContent}
            />
        );
    }
}

const styles = StyleSheet.create({
    postListContent: {
        paddingTop: 5
    }
});
