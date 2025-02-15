/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import { isString, startCase, uniqueId } from 'lodash';
import { ExtraInfo } from 'Models';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { getEntityId, getEntityName } from 'utils/EntityUtils';
import AppState from '../../../AppState';
import { FQN_SEPARATOR_CHAR } from '../../../constants/char.constants';
import { ROUTES } from '../../../constants/constants';
import { EntityType } from '../../../enums/entity.enum';
import { SearchIndex } from '../../../enums/search.enum';
import { CurrentTourPageType } from '../../../enums/tour.enum';
import { OwnerType } from '../../../enums/user.enum';
import { EntityReference } from '../../../generated/entity/type';
import {
  getEntityPlaceHolder,
  getOwnerValue,
} from '../../../utils/CommonUtils';
import {
  getEntityHeaderLabel,
  getServiceIcon,
  getUsagePercentile,
} from '../../../utils/TableUtils';
import { SearchedDataProps } from '../../searched-data/SearchedData.interface';
import '../table-data-card/TableDataCard.style.css';
import TableDataCardBody from '../table-data-card/TableDataCardBody';
import TableDataCardTitle from './TableDataCardTitle.component';
import './TableDataCardV2.less';

export interface TableDataCardPropsV2 {
  id: string;
  className?: string;
  source: SearchedDataProps['data'][number]['_source'];
  matches?: {
    key: string;
    value: number;
  }[];
  searchIndex: SearchIndex | EntityType;
  handleSummaryPanelDisplay?: (
    details: SearchedDataProps['data'][number]['_source'],
    entityType: string
  ) => void;
  checked?: boolean;
  showCheckboxes?: boolean;
  openEntityInNewPage?: boolean;
}

const TableDataCardV2: React.FC<TableDataCardPropsV2> = forwardRef<
  HTMLDivElement,
  TableDataCardPropsV2
>(
  (
    {
      id,
      className,
      source,
      matches,
      searchIndex,
      handleSummaryPanelDisplay,
      showCheckboxes,
      checked,
      openEntityInNewPage = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { tab } = useParams<{ tab: string }>();

    const otherDetails = useMemo(() => {
      const _otherDetails: ExtraInfo[] = [
        {
          key: 'Owner',
          value: getOwnerValue(source.owner as EntityReference),
          placeholderText: getEntityPlaceHolder(
            getEntityName(source.owner as EntityReference),
            source.owner?.deleted
          ),
          id: getEntityId(source.owner as EntityReference),
          isEntityDetails: true,
          isLink: true,
          openInNewTab: false,
          profileName:
            source.owner?.type === OwnerType.USER
              ? source.owner?.name
              : undefined,
        },
      ];

      if (
        source.entityType !== EntityType.GLOSSARY_TERM &&
        source.entityType !== EntityType.TAG
      ) {
        _otherDetails.push({
          key: 'Tier',
          value: source.tier
            ? isString(source.tier)
              ? source.tier
              : source.tier?.tagFQN.split(FQN_SEPARATOR_CHAR)[1]
            : '',
        });
      }

      if ('usageSummary' in source) {
        _otherDetails.push({
          value: getUsagePercentile(
            source.usageSummary?.weeklyStats?.percentileRank || 0,
            true
          ),
        });
      }

      if ('tableType' in source) {
        _otherDetails.push({
          key: 'Type',
          value: source.tableType,
          showLabel: true,
        });
      }

      return _otherDetails;
    }, [source]);

    const handleLinkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (location.pathname.includes(ROUTES.TOUR)) {
        AppState.currentTourPage = CurrentTourPageType.DATASET_PAGE;
      }
    };

    const headerLabel = useMemo(() => {
      return getEntityHeaderLabel(source);
    }, [source]);

    const serviceIcon = useMemo(() => {
      return getServiceIcon(source);
    }, [source]);

    return (
      <div
        className={classNames(
          'data-asset-info-card-container',
          'table-data-card-container',
          className
        )}
        data-testid="table-data-card"
        id={id}
        ref={ref}
        onClick={() => {
          handleSummaryPanelDisplay && handleSummaryPanelDisplay(source, tab);
        }}>
        <div>
          {showCheckboxes && (
            <Checkbox checked={checked} className="float-right" />
          )}
          {headerLabel}
          <div className="tw-flex tw-items-center">
            {serviceIcon}
            <TableDataCardTitle
              handleLinkClick={handleLinkClick}
              id={id}
              openEntityInNewPage={openEntityInNewPage}
              searchIndex={searchIndex}
              source={source}
            />

            {source.deleted && (
              <>
                <div
                  className="tw-rounded tw-bg-error-lite tw-text-error tw-text-xs tw-font-medium tw-h-5 tw-px-1.5 tw-py-0.5 tw-ml-2"
                  data-testid="deleted">
                  <ExclamationCircleOutlined className="tw-mr-1" />
                  {t('label.deleted')}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="tw-pt-3">
          <TableDataCardBody
            description={source.description || ''}
            extraInfo={otherDetails}
            tags={source.tags}
          />
        </div>
        {matches && matches.length > 0 ? (
          <div className="tw-pt-2" data-testid="matches-stats">
            <span className="tw-text-grey-muted">{`${t(
              'label.matches'
            )}:`}</span>
            {matches.map((data, i) => (
              <span className="tw-ml-2" key={uniqueId()}>
                {`${data.value} in ${startCase(data.key)}${
                  i !== matches.length - 1 ? ',' : ''
                }`}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

export default TableDataCardV2;
