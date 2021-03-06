// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getOpenGraphMetadataForUrl} from 'mattermost-redux/selectors/entities/posts';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {ViewTypes} from 'app/constants';
import {getDimensions} from 'app/selectors/device';
import {getTheme} from 'app/selectors/preferences';
import {extractFirstLink} from 'app/utils/url';

import PostBodyAdditionalContent from './post_body_additional_content';

function makeGetFirstLink() {
    let link;
    let lastMessage;

    return (message) => {
        if (message !== lastMessage) {
            link = extractFirstLink(message);
            lastMessage = message;
        }

        return link;
    };
}

function makeMapStateToProps() {
    const getFirstLink = makeGetFirstLink();

    return function mapStateToProps(state, ownProps) {
        const config = getConfig(state);
        const previewsEnabled = getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, `${ViewTypes.FEATURE_TOGGLE_PREFIX}${ViewTypes.EMBED_PREVIEW}`);
        const link = getFirstLink(ownProps.message);

        return {
            ...ownProps,
            ...getDimensions(state),
            config,
            link,
            openGraphData: getOpenGraphMetadataForUrl(state, link),
            showLinkPreviews: previewsEnabled && config.EnableLinkPreviews === 'true',
            theme: getTheme(state)
        };
    };
}

export default connect(makeMapStateToProps)(PostBodyAdditionalContent);
